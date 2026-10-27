-- Prevent duplicate normalized phone numbers without modifying existing records.
create unique index ea_waitlist_phone_unique on public.ea_waitlist_signups(phone);
create or replace function public.ea_waitlist_service(action text, data jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path='' as $$
declare
 entry uuid; result jsonb; count_now integer; current_day date := (now() at time zone 'UTC')::date;
 job public.ea_waitlist_jobs%rowtype; control public.ea_waitlist_control%rowtype;
 kind text := data->>'provider'; page_limit integer := least(100,greatest(1,coalesce((data->>'limit')::integer,50)));
 page_offset integer := least(1000000,greatest(0,coalesce((data->>'offset')::integer,0)));
begin
 if action='rate' then
  delete from public.ea_waitlist_limits where expires<now();
  insert into public.ea_waitlist_limits(key,hits,expires) values(data->>'key',1,(data->>'expires')::timestamptz)
   on conflict(key) do update set hits=ea_waitlist_limits.hits+1 returning hits into count_now;
  return jsonb_build_object('allowed',count_now<=(data->>'max')::integer);
 elsif action='signup' then
  insert into public.ea_waitlist_signups(email,name,surname,phone,country_iso,calling_code,gender,age_band,adult_contact,guardian,interest,product_id,consent_version)
   values(data->>'email',data->>'name',data->>'surname',data->>'phone',data->>'country_iso',data->>'calling_code',data->>'gender',data->>'age_band',(data->>'adult_contact')::boolean,(data->>'guardian')::boolean,data->>'interest',data->>'product_id',data->>'consent_version')
   on conflict do nothing returning id into entry;
  if entry is not null then
   insert into public.ea_waitlist_jobs(signup_id,provider,payload) values(entry,'resend',data->'confirmation'),(entry,'formsubmit',data->'notification');
  end if;
  return jsonb_build_object('accepted',entry is not null);
 elsif action='import_legacy' then
  if jsonb_typeof(data->'rows')<>'array' or jsonb_array_length(data->'rows')>100 then raise exception 'Invalid import batch';end if;
  insert into public.ea_waitlist_signups(email,name,surname,phone,country_iso,calling_code,gender,age_band,legacy,adult_contact,guardian,interest,product_id,consent_version,created_at)
   select x->>'email',x->>'name',x->>'surname',x->>'phone',x->>'country_iso',x->>'calling_code','','',true,false,false,coalesce(x->>'interest','Everyone'),coalesce(x->>'product_id',''),x->>'consent_version',(x->>'created_at')::timestamptz
   from jsonb_array_elements(data->'rows') x on conflict do nothing;
  get diagnostics count_now = row_count;return jsonb_build_object('imported',count_now);
 elsif action='list' then
  with filtered as materialized (
   select s.*,coalesce(r.status,'legacy') email_status,coalesce(f.status,'legacy') notification_status,r.last_error email_error,f.last_error notification_error
   from public.ea_waitlist_signups s
   left join public.ea_waitlist_jobs r on r.signup_id=s.id and r.provider='resend'
   left join public.ea_waitlist_jobs f on f.signup_id=s.id and f.provider='formsubmit'
   where (coalesce(data->>'country','')='' or s.country_iso=data->>'country')
    and (coalesce(data->>'gender','')='' or s.gender=data->>'gender')
    and (coalesce(data->>'age','')='' or s.age_band=data->>'age')
  ) select jsonb_build_object(
   'signups',coalesce((select jsonb_agg(to_jsonb(p) order by p.number desc) from (select * from filtered order by number desc limit page_limit offset page_offset) p),'[]'::jsonb),
   'total',(select count(*) from filtered),'allTotal',(select count(*) from public.ea_waitlist_signups),
   'recent',(select count(*) from filtered where created_at>=now()-interval '7 days'),
   'countries',coalesce((select jsonb_agg(to_jsonb(g) order by g.count desc,g.label) from (select country_iso label,count(*) count from filtered group by country_iso) g),'[]'::jsonb),
   'genders',coalesce((select jsonb_agg(to_jsonb(g) order by g.count desc,g.label) from (select coalesce(nullif(gender,''),'Not provided') label,count(*) count from filtered group by gender) g),'[]'::jsonb),
   'ages',coalesce((select jsonb_agg(to_jsonb(g) order by g.label) from (select coalesce(nullif(age_band,''),'Not provided') label,count(*) count from filtered group by age_band) g),'[]'::jsonb),
   'emailBudget',jsonb_build_object('reserved',coalesce((select reserved from public.ea_waitlist_budget where day=current_day),0),'pending',(select count(*) from public.ea_waitlist_jobs where provider='resend' and status in ('pending','sending')),'review',(select count(*) from public.ea_waitlist_jobs where status='review')),
   'limit',page_limit,'offset',page_offset
  ) into result;return result;
 elsif action='remove' then
  delete from public.ea_waitlist_signups where id=(data->>'id')::uuid;return '{"removed":true}'::jsonb;
 elsif action='claim' then
  select * into control from public.ea_waitlist_control where provider=kind for update;
  if not found or control.paused_until>now() or control.next_request_at>now() then return 'null'::jsonb;end if;
  update public.ea_waitlist_jobs set status=case when provider='formsubmit' then 'review' else 'pending' end,last_error='Previous send was interrupted; acknowledgement unavailable'
   where provider=kind and status='sending' and next_attempt<=now();
  update public.ea_waitlist_jobs set status='review',last_error='Delivery uncertain beyond retry window'
   where provider='resend' and status='pending' and first_attempt<now()-interval '23 hours';
  select j.* into job from public.ea_waitlist_jobs j join public.ea_waitlist_signups s on s.id=j.signup_id
   where j.provider=kind and j.status='pending' and j.next_attempt<=now() order by s.number for update of j skip locked limit 1;
  if not found then return 'null'::jsonb;end if;
  if kind='resend' then
   insert into public.ea_waitlist_budget(day,reserved) values(current_day,0) on conflict(day) do nothing;
   update public.ea_waitlist_budget set reserved=reserved+1 where day=current_day and reserved<100 returning reserved into count_now;
   if not found then return 'null'::jsonb;end if;
  end if;
  update public.ea_waitlist_control set next_request_at=now()+interval '1 second' where provider=kind;
  update public.ea_waitlist_jobs set status='sending',attempts=attempts+1,first_attempt=coalesce(first_attempt,now()),next_attempt=now()+interval '5 minutes',lease=gen_random_uuid()
   where id=job.id returning * into job;return to_jsonb(job);
 elsif action='finish' then
  select * into job from public.ea_waitlist_jobs where id=(data->>'id')::uuid and lease=(data->>'lease')::uuid and status='sending' for update;
  if not found then return '{"updated":false}'::jsonb;end if;
  if data->>'outcome'='submitted' then
   update public.ea_waitlist_jobs set status='submitted',last_error='',lease=null where id=job.id;
  elsif data->>'outcome'='quota' and job.provider='resend' then
   update public.ea_waitlist_control set paused_until=(current_day+1)::timestamp at time zone 'UTC' where provider='resend';
   update public.ea_waitlist_jobs set status='pending',first_attempt=case when job.attempts=1 or job.last_error='Provider quota reached' then null else first_attempt end,next_attempt=(current_day+1)::timestamp at time zone 'UTC',last_error='Provider quota reached',lease=null where id=job.id;
  else
   update public.ea_waitlist_jobs set status=case when job.provider='formsubmit' or data->>'outcome'='review' then 'review' else 'pending' end,
    last_error=case when data->>'outcome'='review' then 'Provider rejected submission; check configuration' else 'Delivery acknowledgement unavailable' end,lease=null where id=job.id;
  end if;return '{"updated":true}'::jsonb;
 end if;
 raise exception 'Unknown waiting-list action';
end $$;

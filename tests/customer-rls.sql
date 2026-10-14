-- Run against the dedicated account database. All fixtures are rolled back.
begin;
select set_config('test.customer_a',gen_random_uuid()::text,true);
select set_config('test.customer_b',gen_random_uuid()::text,true);
insert into auth.users (id,email,aud,role,raw_user_meta_data,raw_app_meta_data,created_at,updated_at)
values (current_setting('test.customer_a')::uuid,'rls-a@exclusive-apparel.invalid','authenticated','authenticated','{"full_name":"Customer A","admin":true}'::jsonb,'{}'::jsonb,now(),now()),
(current_setting('test.customer_b')::uuid,'rls-b@exclusive-apparel.invalid','authenticated','authenticated','{"full_name":"Customer B"}'::jsonb,'{}'::jsonb,now(),now());
do $$ begin
if (select count(*) from public.customer_profiles where id in (current_setting('test.customer_a')::uuid,current_setting('test.customer_b')::uuid)) <> 2 then raise exception 'Profile trigger failed';end if;
end $$;
set local role anon;
do $$ declare blocked boolean:=false;begin
begin perform * from public.customer_profiles;exception when insufficient_privilege then blocked:=true;end;
if not blocked then raise exception 'Anonymous profile access was allowed';end if;
if has_function_privilege(current_user,'public.rls_auto_enable()','execute') then raise exception 'Anonymous helper execution allowed';end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.customer_a'),'role','authenticated')::text,true);
do $$ declare changed integer;blocked boolean:=false;begin
if (select count(*) from public.customer_profiles) <> 1 then raise exception 'Customer A can see another profile';end if;
if not exists(select 1 from public.customer_profiles where id=current_setting('test.customer_a')::uuid and full_name='Customer A') then raise exception 'Customer A cannot see their own profile';end if;
update public.customer_profiles set full_name='Own name updated' where id=current_setting('test.customer_a')::uuid;get diagnostics changed=row_count;
if changed<>1 then raise exception 'Own profile update failed';end if;
update public.customer_profiles set full_name='Stolen profile' where id=current_setting('test.customer_b')::uuid;get diagnostics changed=row_count;
if changed<>0 then raise exception 'Cross-customer update allowed';end if;
begin update public.customer_profiles set id=current_setting('test.customer_b')::uuid where id=current_setting('test.customer_a')::uuid;exception when insufficient_privilege then blocked:=true;end;
if not blocked then raise exception 'Profile ownership change allowed';end if;
blocked:=false;
begin insert into public.customer_profiles(id,full_name) values (current_setting('test.customer_b')::uuid,'Injected owner');exception when insufficient_privilege then blocked:=true;end;
if not blocked then raise exception 'Cross-customer insert allowed';end if;
if has_function_privilege(current_user,'public.rls_auto_enable()','execute') then raise exception 'Customer helper execution allowed';end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.customer_b'),'role','authenticated')::text,true);
do $$ begin
if (select count(*) from public.customer_profiles)<>1 then raise exception 'Customer B can see another profile';end if;
if not exists(select 1 from public.customer_profiles where id=current_setting('test.customer_b')::uuid and full_name='Customer B') then raise exception 'Customer B profile changed';end if;
end $$;
select set_config('request.jwt.claims','{}',true);
do $$ begin if (select count(*) from public.customer_profiles)<>0 then raise exception 'Missing identity can read profiles';end if;end $$;
reset role;
rollback;
select 'passed' as profile_trigger_and_customer_isolation,
(select count(*) from auth.users where email in ('rls-a@exclusive-apparel.invalid','rls-b@exclusive-apparel.invalid')) as remaining_fixture_users,
(select count(*) from public.customer_profiles) as profiles_after_rollback;

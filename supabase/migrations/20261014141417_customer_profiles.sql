-- Customer account data uses Supabase Auth identity; no service-role bypass.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  created_at timestamptz not null default now()
);
alter table public.customer_profiles enable row level security;
alter table public.customer_profiles force row level security;
revoke all on public.customer_profiles from anon, authenticated;
grant select on public.customer_profiles to authenticated;
grant insert (id, full_name), update (full_name) on public.customer_profiles to authenticated;
create policy customer_profile_read on public.customer_profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy customer_profile_insert on public.customer_profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy customer_profile_update on public.customer_profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create function private.create_customer_profile() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  insert into public.customer_profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'full_name',''),100));
  return new;
end;
$$;
revoke all on function private.create_customer_profile() from public, anon, authenticated;
create trigger exclusive_customer_created after insert on auth.users
  for each row execute function private.create_customer_profile();

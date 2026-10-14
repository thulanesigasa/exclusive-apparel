-- Keep the automatic RLS event trigger, but remove unnecessary API-role access.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

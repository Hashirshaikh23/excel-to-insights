-- Admin-only aggregated usage over analyses with email from auth.users
-- SECURITY DEFINER allows reading auth schema; guarded by profiles.role = 'admin'
create or replace function public.admin_user_usage()
returns table (user_id uuid, email text, count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- guard: only admins can call this
  if not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'forbidden';
  end if;

  return query
    select a.user_id,
           u.email,
           count(*)::bigint as count
    from public.analyses a
    left join auth.users u on u.id = a.user_id
    group by a.user_id, u.email
    order by count(*) desc;
end $$;

revoke all on function public.admin_user_usage() from public;
grant execute on function public.admin_user_usage() to authenticated;

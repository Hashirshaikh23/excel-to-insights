create or replace function public.admin_user_usage()
returns table(user_id uuid, email text, count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only allow admins
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'not authorized';
  end if;

  return query
  select a.user_id, p.email, count(*)::bigint
  from public.analyses a
  left join public.profiles p on p.id = a.user_id
  group by a.user_id, p.email
  order by count(*) desc;
end;
$$;

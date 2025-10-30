-- add safe RLS policies so users can insert/select their own rows
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'analyses' and policyname = 'analyses_insert_own'
  ) then
    create policy analyses_insert_own
      on public.analyses for insert
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'analyses' and policyname = 'analyses_select_own'
  ) then
    create policy analyses_select_own
      on public.analyses for select
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'analyses' and policyname = 'analyses_delete_own'
  ) then
    create policy analyses_delete_own
      on public.analyses for delete
      using (user_id = auth.uid());
  end if;
end
$$;

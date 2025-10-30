// Run this once against your Supabase project.
alter table public.analyses enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'analyses' and policyname = 'Users can delete own analyses'
  ) then
    create policy "Users can delete own analyses"
      on public.analyses
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Optional: ensure API role can reference the table
grant delete on table public.analyses to anon, authenticated;

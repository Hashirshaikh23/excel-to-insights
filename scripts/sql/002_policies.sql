-- Enable RLS
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;

-- Profiles: users can read only their own profile
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own') then
    create policy profiles_select_own on public.profiles
      for select using (auth.uid() = id);
  end if;
end$$;

-- Profiles: only service role or admins should update roles; disallow public updates
-- (skip update/insert policies for regular users)

-- Analyses: owner-only access
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'analyses' and policyname = 'analyses_select_own') then
    create policy analyses_select_own on public.analyses
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'analyses' and policyname = 'analyses_insert_own') then
    create policy analyses_insert_own on public.analyses
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'analyses' and policyname = 'analyses_update_own') then
    create policy analyses_update_own on public.analyses
      for update using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'analyses' and policyname = 'analyses_delete_own') then
    create policy analyses_delete_own on public.analyses
      for delete using (auth.uid() = user_id);
  end if;
end$$;

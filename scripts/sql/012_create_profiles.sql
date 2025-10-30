-- Create profiles table with basic role-based access control and backfill from existing users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS: users can read/update their own profile; admins can read all
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'profiles' and policyname = 'profiles_select_self'
  ) then
    create policy profiles_select_self
      on public.profiles for select
      using (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'profiles' and policyname = 'profiles_update_self'
  ) then
    create policy profiles_update_self
      on public.profiles for update
      using (id = auth.uid());
  end if;
end
$$;

-- Backfill any missing profile rows for existing users
insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

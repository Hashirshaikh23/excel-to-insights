-- Profiles (user role)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

-- Create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role) values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Analyses history
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  columns text[] not null,
  x_key text not null,
  y_key text,
  chart_type text not null,
  sample_rows jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;

create policy "Profiles are viewable by owner"
on public.profiles for select
using (id = auth.uid());

create policy "Analyses viewable by owner"
on public.analyses for select
using (user_id = auth.uid());

create policy "Analyses insert by owner"
on public.analyses for insert
with check (user_id = auth.uid());

-- Admin usage RPC
create or replace function public.admin_user_usage()
returns table(user_id uuid, email text, count bigint)
language sql security definer set search_path = public as $$
  select a.user_id, u.email, count(*)::bigint
  from analyses a
  join auth.users u on u.id = a.user_id
  group by a.user_id, u.email
  order by count desc
$$;

-- Optional: grant select to authenticated users for own rows (via policies above)

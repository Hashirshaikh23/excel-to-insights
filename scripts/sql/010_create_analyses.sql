-- create the analyses table required by /api/history and enable RLS
create extension if not exists "pgcrypto";

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text,
  columns jsonb,
  x_key text,
  y_key text,
  chart_type text,
  sample_rows jsonb,
  created_at timestamptz not null default now()
);

alter table public.analyses enable row level security;

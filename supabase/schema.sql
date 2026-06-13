-- Fusion OS Supabase schema
-- Run this manually in Supabase SQL Editor.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('Admin', 'Member');
  end if;

  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type user_status as enum ('Active', 'Inactive');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role app_role not null default 'Member',
  avatar text,
  status user_status not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.ventures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  stage text not null,
  priority text not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venture_tasks (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id) on delete cascade,
  title text not null,
  category text not null,
  status text not null default 'To Do',
  priority text not null default 'Medium',
  assigned_to uuid references public.users(id) on delete set null,
  due_date date,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.web_dev_leads (
  id uuid primary key default gen_random_uuid(),
  client text not null,
  service text not null,
  estimated_amount numeric(12, 2) not null default 0,
  received_amount numeric(12, 2) not null default 0,
  balance_amount numeric(12, 2) generated always as (estimated_amount - received_amount) stored,
  lead_status text not null default 'New Lead',
  work_status text not null default 'Not Started',
  lead_by uuid references public.users(id) on delete set null,
  next_action text,
  follow_up_date date,
  notes text,
  contact_person text,
  phone text,
  email text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venture_updates (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id) on delete cascade,
  update_text text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.venture_links (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id) on delete cascade,
  title text not null,
  url text not null,
  type text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ventures_updated_at on public.ventures;
create trigger set_ventures_updated_at
before update on public.ventures
for each row execute function public.set_updated_at();

drop trigger if exists set_venture_tasks_updated_at on public.venture_tasks;
create trigger set_venture_tasks_updated_at
before update on public.venture_tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_web_dev_leads_updated_at on public.web_dev_leads;
create trigger set_web_dev_leads_updated_at
before update on public.web_dev_leads
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::app_role, 'Member'),
    'Active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.ventures enable row level security;
alter table public.venture_tasks enable row level security;
alter table public.web_dev_leads enable row level security;
alter table public.venture_updates enable row level security;
alter table public.venture_links enable row level security;

create or replace function public.current_user_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create policy "Users can read their profile"
on public.users for select
to authenticated
using (id = auth.uid() or public.current_user_role() = 'Admin');

create policy "Admins can update users"
on public.users for update
to authenticated
using (public.current_user_role() = 'Admin')
with check (public.current_user_role() = 'Admin');

create policy "Authenticated users can read ventures"
on public.ventures for select
to authenticated
using (true);

create policy "Admins can manage ventures"
on public.ventures for all
to authenticated
using (public.current_user_role() = 'Admin')
with check (public.current_user_role() = 'Admin');

create policy "Users can read assigned tasks or admins read all"
on public.venture_tasks for select
to authenticated
using (assigned_to = auth.uid() or public.current_user_role() = 'Admin');

create policy "Admins can manage tasks"
on public.venture_tasks for all
to authenticated
using (public.current_user_role() = 'Admin')
with check (public.current_user_role() = 'Admin');

create policy "Members can update their assigned task status"
on public.venture_tasks for update
to authenticated
using (assigned_to = auth.uid())
with check (assigned_to = auth.uid());

create policy "Authenticated users can read web dev leads"
on public.web_dev_leads for select
to authenticated
using (true);

create policy "Admins can manage web dev leads"
on public.web_dev_leads for all
to authenticated
using (public.current_user_role() = 'Admin')
with check (public.current_user_role() = 'Admin');

create policy "Authenticated users can read venture updates"
on public.venture_updates for select
to authenticated
using (true);

create policy "Authenticated users can create venture updates"
on public.venture_updates for insert
to authenticated
with check (created_by = auth.uid());

create policy "Admins can manage venture updates"
on public.venture_updates for all
to authenticated
using (public.current_user_role() = 'Admin')
with check (public.current_user_role() = 'Admin');

create policy "Authenticated users can read venture links"
on public.venture_links for select
to authenticated
using (true);

create policy "Admins can manage venture links"
on public.venture_links for all
to authenticated
using (public.current_user_role() = 'Admin')
with check (public.current_user_role() = 'Admin');

create index if not exists idx_ventures_slug on public.ventures(slug);
create index if not exists idx_venture_tasks_venture_id on public.venture_tasks(venture_id);
create index if not exists idx_venture_tasks_assigned_to on public.venture_tasks(assigned_to);
create index if not exists idx_web_dev_leads_lead_by on public.web_dev_leads(lead_by);
create index if not exists idx_web_dev_leads_follow_up_date on public.web_dev_leads(follow_up_date);
create index if not exists idx_venture_updates_venture_id on public.venture_updates(venture_id);
create index if not exists idx_venture_links_venture_id on public.venture_links(venture_id);

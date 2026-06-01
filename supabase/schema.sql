-- LughaPro content marketplace schema (run in Supabase SQL editor)

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  level text default 'All',
  price numeric default 0,
  cover_image_url text,
  file_url text,
  tags text[] default '{}',
  language text default 'Kiswahili',
  content_type text default 'book',
  published boolean default true,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  title text not null,
  content text not null,
  cover_image_url text,
  is_premium boolean default false,
  price numeric default 0,
  tags text[] default '{}',
  language text default 'Kiswahili',
  published boolean default true,
  created_at timestamptz default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_wallet text not null,
  content_id uuid not null,
  content_type text not null,
  amount numeric default 0,
  progress_status text default 'not_started',
  progress_percent numeric default 0,
  purchased_at timestamptz default now(),
  unique (user_wallet, content_id, content_type)
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  student_wallet text not null,
  course_name text not null,
  creator_name text not null,
  level text,
  earned_at timestamptz default now()
);

alter table profiles add column if not exists country text;
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists languages text[];
alter table profiles add column if not exists onboarding_completed boolean default false;

alter table tutors add column if not exists is_verified boolean default false;
alter table tutors add column if not exists is_featured boolean default false;
alter table tutors add column if not exists total_reviews integer default 0;

alter table books add column if not exists published boolean default true;
alter table posts add column if not exists published boolean default true;
alter table purchases add column if not exists progress_status text default 'not_started';
alter table purchases add column if not exists progress_percent numeric default 0;

-- ---------------------------------------------------------------------------
-- Row Level Security (wallet auth validated server-side; permissive policies)
-- Run in Supabase SQL editor, or: POST /api/admin/apply-rls-policies
-- ---------------------------------------------------------------------------

alter table public.books enable row level security;
alter table public.posts enable row level security;
alter table public.purchases enable row level security;
alter table public.profiles enable row level security;
alter table public.tutors enable row level security;

drop policy if exists "Creators can insert books" on public.books;
create policy "Creators can insert books" on public.books for insert with check (true);

drop policy if exists "Anyone can insert posts" on public.posts;
create policy "Anyone can insert posts" on public.posts for insert with check (true);

drop policy if exists "Anyone can insert purchases" on public.purchases;
create policy "Anyone can insert purchases" on public.purchases for insert with check (true);

drop policy if exists "Anyone can update books" on public.books;
create policy "Anyone can update books" on public.books for update using (true);

drop policy if exists "Anyone can update posts" on public.posts;
create policy "Anyone can update posts" on public.posts for update using (true);

drop policy if exists "Anyone can read purchases" on public.purchases;
create policy "Anyone can read purchases" on public.purchases for select using (true);

drop policy if exists "Anyone can insert profiles" on public.profiles;
create policy "Anyone can insert profiles" on public.profiles for insert with check (true);

drop policy if exists "Anyone can update profiles" on public.profiles;
create policy "Anyone can update profiles" on public.profiles for update using (true);

drop policy if exists "Anyone can insert tutors" on public.tutors;
create policy "Anyone can insert tutors" on public.tutors for insert with check (true);

drop policy if exists "Anyone can update tutors" on public.tutors;
create policy "Anyone can update tutors" on public.tutors for update using (true);

-- Callable from API (service role) after function is created in SQL editor once
create or replace function public.apply_lugha_rls_policies()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  drop policy if exists "Creators can insert books" on public.books;
  create policy "Creators can insert books" on public.books for insert with check (true);

  drop policy if exists "Anyone can insert posts" on public.posts;
  create policy "Anyone can insert posts" on public.posts for insert with check (true);

  drop policy if exists "Anyone can insert purchases" on public.purchases;
  create policy "Anyone can insert purchases" on public.purchases for insert with check (true);

  drop policy if exists "Anyone can update books" on public.books;
  create policy "Anyone can update books" on public.books for update using (true);

  drop policy if exists "Anyone can update posts" on public.posts;
  create policy "Anyone can update posts" on public.posts for update using (true);

  drop policy if exists "Anyone can read purchases" on public.purchases;
  create policy "Anyone can read purchases" on public.purchases for select using (true);

  drop policy if exists "Anyone can insert profiles" on public.profiles;
  create policy "Anyone can insert profiles" on public.profiles for insert with check (true);

  drop policy if exists "Anyone can update profiles" on public.profiles;
  create policy "Anyone can update profiles" on public.profiles for update using (true);

  drop policy if exists "Anyone can insert tutors" on public.tutors;
  create policy "Anyone can insert tutors" on public.tutors for insert with check (true);

  drop policy if exists "Anyone can update tutors" on public.tutors;
  create policy "Anyone can update tutors" on public.tutors for update using (true);

  return jsonb_build_object('ok', true, 'message', 'RLS policies applied');
exception
  when others then
    return jsonb_build_object('ok', false, 'error', SQLERRM);
end;
$$;

grant execute on function public.apply_lugha_rls_policies() to service_role;

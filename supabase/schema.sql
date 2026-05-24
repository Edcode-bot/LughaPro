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

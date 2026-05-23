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
  created_at timestamptz default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_wallet text not null,
  content_id uuid not null,
  content_type text not null,
  amount numeric default 0,
  purchased_at timestamptz default now(),
  unique (user_wallet, content_id, content_type)
);

alter table profiles add column if not exists country text;
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists languages text[];

alter table tutors add column if not exists is_verified boolean default false;
alter table tutors add column if not exists is_featured boolean default false;
alter table tutors add column if not exists total_reviews integer default 0;

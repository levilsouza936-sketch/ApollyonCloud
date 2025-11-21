-- Migration: Create announcements table
-- Run this in Supabase SQL Editor

create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text not null,
  button_text text default 'Ver Oferta',
  button_link text,
  active boolean default true,
  show_once_per_session boolean default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.announcements enable row level security;

-- Policy: Everyone can view announcements
create policy "Announcements are viewable by everyone."
  on announcements for select
  using ( true );

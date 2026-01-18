-- Create a table to store user integrations
create table if not exists user_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Changed to text to match Google ID
  platform text not null, -- e.g. 'gmail', 'slack'
  status text not null, -- 'ACTIVE', 'CONNECTED', 'DISCONNECTED'
  connected_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  meta jsonb default '{}'::jsonb,
  
  -- Prevent duplicate entries for the same user + platform
  unique(user_id, platform)
);

-- Users Table (for Auth & Subscriptions)
create table if not exists public.users (
  id text primary key, -- Google ID
  email text not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  subscription_tier text default 'free', -- 'free' or 'pro'
  subscription_status text default 'active', -- 'active', 'canceled'
  last_login_at timestamp with time zone default now()
);

-- RLS Policies
alter table user_integrations enable row level security;
alter table public.users enable row level security;

-- (For local dev, you might want to allow all or setup specific service role policies)
-- Since the backend uses the Service Role Key, it bypasses RLS.
-- These are mainly if you access Supabase from frontend directly.

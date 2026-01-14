-- Create a table to store user integrations
create table if not exists user_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null, -- references auth.users(id) if using Supabase Auth, or just text if external
  platform text not null, -- e.g. 'gmail', 'slack'
  status text not null, -- 'ACTIVE', 'CONNECTED', 'DISCONNECTED'
  connected_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  meta jsonb default '{}'::jsonb,
  
  -- Prevent duplicate entries for the same user + platform
  unique(user_id, platform)
);

-- Basic RLS policies (optional if using Service Role Key on backend, but good practice)
alter table user_integrations enable row level security;

create policy "Users can view their own integrations"
  on user_integrations for select
  using (auth.uid() = user_id);

create policy "Users can update their own integrations"
  on user_integrations for update
  using (auth.uid() = user_id);

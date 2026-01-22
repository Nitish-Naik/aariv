-- Function to insert user profile on auth.users creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, created_at, last_login_at)
  values (new.id, new.email, now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call function after new auth.users row
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


create policy "Users can view their own profile"
on public.users
for select using (auth.uid()::text = id);

create policy "Allow self-update"
on public.users
for update using (auth.uid()::text = id)
with check (auth.uid()::text = id);


alter table public.user_integrations enable row level security;

-- SELECT policy (no WITH CHECK)
create policy "Owner can access their integrations"
on public.user_integrations
for select using (auth.uid()::text = user_id);

-- INSERT policy (WITH CHECK required)
create policy "Owner can insert integrations"
on public.user_integrations
for insert with check (auth.uid()::text = user_id);

-- UPDATE policy (WITH CHECK required)
create policy "Owner can update their integrations"
on public.user_integrations
for update using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);
alter table public.todos enable row level security;
create policy "users can read own todos" on public.todos for select using (auth.uid() = user_id);

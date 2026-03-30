alter table public.users enable row level security;
create policy "users can delete self" on public.users for delete using (auth.uid() = id);

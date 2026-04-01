alter table public.todos enable row level security;
create policy "todos_select_own" on public.todos
for select
using (auth.uid() = user_id);

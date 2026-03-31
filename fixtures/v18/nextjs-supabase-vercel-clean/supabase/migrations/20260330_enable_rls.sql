alter table profiles enable row level security;
create policy "profiles_select_own"
on profiles
for select
using (auth.uid() = user_id);

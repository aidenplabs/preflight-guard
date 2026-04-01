create table if not exists public.todos (
  id uuid primary key,
  title text not null
);

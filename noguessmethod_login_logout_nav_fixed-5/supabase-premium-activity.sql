-- Optional table for the /premium interactive page.
-- The page works with localStorage without this table, but this enables Supabase sync.
create table if not exists public.premium_activity (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.premium_activity enable row level security;

create policy "premium activity read own"
on public.premium_activity for select
to authenticated
using (auth.uid() = user_id);

create policy "premium activity insert own"
on public.premium_activity for insert
to authenticated
with check (auth.uid() = user_id);

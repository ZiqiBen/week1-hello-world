-- Week 5: private solved-problem tracking for each user's Algorithm Galaxy.
-- Run this in the Supabase SQL Editor after Week 4.

create table if not exists public.solved_problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pattern_id bigint not null references public.patterns(id) on delete cascade,
  problem_name text not null,
  solved_at timestamptz not null default now(),
  unique (user_id, pattern_id)
);

alter table public.solved_problems enable row level security;

revoke all on table public.solved_problems from anon, authenticated;
grant select, insert, delete on table public.solved_problems to authenticated;

drop policy if exists "Users can read own solved problems" on public.solved_problems;
drop policy if exists "Users can add own solved problems" on public.solved_problems;
drop policy if exists "Users can delete own solved problems" on public.solved_problems;

create policy "Users can read own solved problems"
  on public.solved_problems for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can add own solved problems"
  on public.solved_problems for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own solved problems"
  on public.solved_problems for delete to authenticated
  using (auth.uid() = user_id);


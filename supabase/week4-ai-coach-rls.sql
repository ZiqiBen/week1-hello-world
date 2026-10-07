-- Week 4: AI generation, voting, and RLS setup.
-- Run this in Supabase SQL Editor after Week 3 is working.

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  prompt text not null,
  generated_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.generation_votes (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.ai_generations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote integer not null check (vote in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (generation_id, user_id)
);

alter table public.patterns enable row level security;
alter table public.profiles enable row level security;
alter table public.ai_generations enable row level security;
alter table public.generation_votes enable row level security;

grant select on table public.patterns to anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select on table public.profiles to anon, authenticated;
grant select, insert on table public.ai_generations to anon, authenticated;
grant select, insert, update, delete on table public.generation_votes to authenticated;
grant select on table public.generation_votes to anon;

-- patterns: public read-only content.
drop policy if exists "Anyone can read patterns" on public.patterns;
create policy "Anyone can read patterns"
  on public.patterns for select
  using (true);

-- profiles: users manage only their own profile; public can read display info for authors.
drop policy if exists "Anyone can read profiles" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Anyone can read profiles"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- AI generations: visible feed; only logged-in users can create their own rows.
drop policy if exists "Anyone can read AI generations" on public.ai_generations;
drop policy if exists "Authenticated users can create own AI generations" on public.ai_generations;

create policy "Anyone can read AI generations"
  on public.ai_generations for select
  using (true);

create policy "Authenticated users can create own AI generations"
  on public.ai_generations for insert to authenticated
  with check (auth.uid() = user_id);

-- Votes: visible counts; only logged-in users can create/change their own vote.
drop policy if exists "Anyone can read generation votes" on public.generation_votes;
drop policy if exists "Authenticated users can vote once per generation" on public.generation_votes;
drop policy if exists "Users can update own votes" on public.generation_votes;
drop policy if exists "Users can delete own votes" on public.generation_votes;

create policy "Anyone can read generation votes"
  on public.generation_votes for select
  using (true);

create policy "Authenticated users can vote once per generation"
  on public.generation_votes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own votes"
  on public.generation_votes for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.generation_votes for delete to authenticated
  using (auth.uid() = user_id);

-- Keep the Week 3 avatar bucket usable under RLS.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "Anyone can view avatars" on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Users can update their own avatars" on storage.objects;

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');

create policy "Users can update their own avatars"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and owner = auth.uid())
  with check (bucket_id = 'avatars' and owner = auth.uid());

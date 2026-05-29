-- ============================================================
-- Bracket Bucks 2026 World Cup - Supabase Schema v2
-- Run in Supabase SQL Editor (safe to re-run)
-- ============================================================

-- LEAGUES table (shared with March Madness)
create table if not exists leagues (
  id serial primary key,
  code text unique not null,
  name text,
  created_at timestamptz default now()
);

-- OWNERS table (shared, per league_code)
create table if not exists owners (
  id serial primary key,
  league_code text not null,
  name text not null,
  color text default '#ffffff',
  num integer default 1,
  teams jsonb default '[]',
  user_id uuid,
  created_at timestamptz default now()
);

-- WINS table (World Cup version uses team_name + round_id strings)
create table if not exists wins (
  id serial primary key,
  league_code text not null,
  owner_id integer references owners(id) on delete cascade,
  team_name text,
  team_index integer,   -- kept for MM compatibility
  round_id text,        -- e.g. "Pool Play", "Round of 32"
  created_at timestamptz default now()
);

-- DRAWS table (new for World Cup - Pool Play draws)
create table if not exists draws (
  id serial primary key,
  league_code text not null,
  owner_id integer references owners(id) on delete cascade,
  team_name text not null,
  round_id text not null default 'Pool Play',
  created_at timestamptz default now()
);

-- Seed the CHI2025 league
insert into leagues (code, name) values ('CHI2025', 'Chicago 2026 World Cup')
on conflict (code) do nothing;

-- RLS
alter table leagues enable row level security;
alter table owners  enable row level security;
alter table wins    enable row level security;
alter table draws   enable row level security;

-- Public read
create policy if not exists "Public read leagues" on leagues for select using (true);
create policy if not exists "Public read owners"  on owners  for select using (true);
create policy if not exists "Public read wins"    on wins    for select using (true);
create policy if not exists "Public read draws"   on draws   for select using (true);

-- Anon insert/delete for admin operations (PIN-protected in app)
create policy if not exists "Anon insert wins"  on wins  for insert to anon with check (true);
create policy if not exists "Anon delete wins"  on wins  for delete to anon using (true);
create policy if not exists "Anon insert draws" on draws for insert to anon with check (true);
create policy if not exists "Anon delete draws" on draws for delete to anon using (true);
create policy if not exists "Anon update owners" on owners for update to anon using (true);
create policy if not exists "Anon insert owners" on owners for insert to anon with check (true);

-- ============================================================
-- Bracket Bucks 2026 World Cup - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. TEAMS TABLE (48 teams across 12 groups)
create table if not exists teams (
  id serial primary key,
  name text not null,
  group_name text not null,
  seed integer not null
);

-- 2. PLAYERS TABLE (the 8 participants)
create table if not exists players (
  id serial primary key,
  name text not null unique
);

-- 3. PLAYER_TEAMS (which teams each player "owns")
create table if not exists player_teams (
  id serial primary key,
  player_id integer references players(id) on delete cascade,
  team_id integer references teams(id) on delete cascade,
  unique(player_id, team_id)
);

-- 4. GAME RESULTS (admin enters after each match)
create table if not exists game_results (
  id serial primary key,
  round text not null check (round in ('Pool Play','Round of 32','Round of 16','Round of 8','Round of 4','Championship')),
  team_id integer references teams(id) on delete cascade,
  result text not null check (result in ('win','draw','loss')),
  match_date date default current_date,
  created_at timestamptz default now()
);

-- 5. SETTINGS (league code, buy-in amount, etc.)
create table if not exists settings (
  key text primary key,
  value text not null
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert players
insert into players (name) values
  ('Alex Jurich'),
  ('Matt Sevenich'),
  ('Stephen Sevenich'),
  ('Will Kelly'),
  ('Connor Quicksell'),
  ('Josh Galati'),
  ('Tony Barbato'),
  ('Nick Johnson')
on conflict (name) do nothing;

-- Insert all 48 teams
insert into teams (name, group_name, seed) values
  ('Mexico', 'Group A', 4),
  ('South Africa', 'Group A', 10),
  ('Republic of Korea', 'Group A', 9),
  ('Czechia', 'Group A', 7),
  ('Canada', 'Group B', 7),
  ('Bosnia and Herzegovina', 'Group B', 8),
  ('Qatar', 'Group B', 11),
  ('Switzerland', 'Group B', 5),
  ('Brazil', 'Group C', 1),
  ('Morocco', 'Group C', 3),
  ('Haiti', 'Group C', 12),
  ('Scotland', 'Group C', 7),
  ('USA', 'Group D', 4),
  ('Paraguay', 'Group D', 6),
  ('Australia', 'Group D', 9),
  ('Turkey', 'Group D', 5),
  ('Germany', 'Group E', 2),
  ('Curacao', 'Group E', 12),
  ('Ivory Coast', 'Group E', 7),
  ('Ecuador', 'Group E', 5),
  ('Netherlands', 'Group F', 2),
  ('Japan', 'Group F', 4),
  ('Sweden', 'Group F', 6),
  ('Tunisia', 'Group F', 9),
  ('Belgium', 'Group G', 3),
  ('Egypt', 'Group G', 8),
  ('Iran', 'Group G', 9),
  ('New Zealand', 'Group G', 11),
  ('Spain', 'Group H', 1),
  ('Cape Verde', 'Group H', 12),
  ('Saudi Arabia', 'Group H', 10),
  ('Uruguay', 'Group H', 4),
  ('France', 'Group I', 1),
  ('Senegal', 'Group I', 6),
  ('Iraq', 'Group I', 11),
  ('Norway', 'Group I', 3),
  ('Argentina', 'Group J', 2),
  ('Algeria', 'Group J', 8),
  ('Austria', 'Group J', 6),
  ('Jordan', 'Group J', 12),
  ('Portugal', 'Group K', 2),
  ('Congo DR', 'Group K', 10),
  ('Uzbekistan', 'Group K', 11),
  ('Colombia', 'Group K', 3),
  ('England', 'Group L', 1),
  ('Croatia', 'Group L', 5),
  ('Ghana', 'Group L', 8),
  ('Panama', 'Group L', 10);

-- Insert settings
insert into settings (key, value) values
  ('league_code', 'CHI2025'),
  ('buy_in_amount', '25'),
  ('tournament_name', '2026 World Cup')
on conflict (key) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table teams enable row level security;
alter table players enable row level security;
alter table player_teams enable row level security;
alter table game_results enable row level security;
alter table settings enable row level security;

-- Public read access for all tables
create policy "Public read teams" on teams for select using (true);
create policy "Public read players" on players for select using (true);
create policy "Public read player_teams" on player_teams for select using (true);
create policy "Public read game_results" on game_results for select using (true);
create policy "Public read settings" on settings for select using (true);

-- Authenticated write for game_results (admin only)
create policy "Auth insert game_results" on game_results for insert to authenticated with check (true);
create policy "Auth update game_results" on game_results for update to authenticated using (true);
create policy "Auth delete game_results" on game_results for delete to authenticated using (true);

-- Authenticated write for player_teams (admin setup)
create policy "Auth insert player_teams" on player_teams for insert to authenticated with check (true);
create policy "Auth delete player_teams" on player_teams for delete to authenticated using (true);

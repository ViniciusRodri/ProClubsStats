-- ============================================================================
-- CAMPEONATO PRO CLUBS — SCHEMA SUPABASE
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- ============================================================================

-- Extensões
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type match_format as enum ('MD1', 'MD3', 'MD5', 'MD7');
create type competition_stage as enum ('grupos', 'semifinal', 'final');
create type match_status as enum ('agendado', 'ao_vivo', 'finalizado', 'wo');
create type group_name as enum ('A', 'B');

-- ----------------------------------------------------------------------------
-- TIMES
-- ----------------------------------------------------------------------------
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  short_name text,
  logo_url text,
  group_name group_name,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- JOGADORES
-- ----------------------------------------------------------------------------
create table players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  position text,
  shirt_number int,
  is_goalkeeper boolean not null default false,
  created_at timestamptz not null default now()
);

create index players_team_id_idx on players(team_id);

-- ----------------------------------------------------------------------------
-- SÉRIES (o confronto entre dois times num formato MD1/MD3/MD5/MD7)
-- Cada jogo individual da série vira uma linha em `matches`.
-- ----------------------------------------------------------------------------
create table series (
  id uuid primary key default gen_random_uuid(),
  stage competition_stage not null,
  format match_format not null,
  team_home_id uuid not null references teams(id),
  team_away_id uuid not null references teams(id),
  team_home_wins int not null default 0,
  team_away_wins int not null default 0,
  winner_team_id uuid references teams(id),
  round_label text, -- ex: "Semifinal 1", "Grande Final", "Rodada 1 - Grupo A"
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PARTIDAS (cada jogo dentro de uma série)
-- ----------------------------------------------------------------------------
create table matches (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references series(id) on delete cascade,
  game_number int not null default 1,
  team_home_id uuid not null references teams(id),
  team_away_id uuid not null references teams(id),
  home_score int,
  away_score int,
  went_to_extra_time boolean not null default false,
  penalty_home_score int,
  penalty_away_score int,
  status match_status not null default 'agendado',
  scheduled_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (series_id, game_number)
);

create index matches_series_id_idx on matches(series_id);
create index matches_status_idx on matches(status);

-- Garante que só existe uma partida "ao_vivo" por vez (fica em destaque no site).
create unique index one_live_match_idx on matches ((status = 'ao_vivo')) where status = 'ao_vivo';

-- ----------------------------------------------------------------------------
-- ESTATÍSTICAS DE JOGADOR POR PARTIDA
-- ----------------------------------------------------------------------------
create table player_match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  team_id uuid not null references teams(id),
  goals int not null default 0,
  assists int not null default 0,
  rating numeric(3,1),
  yellow_cards int not null default 0,
  red_cards int not null default 0,
  saves int,
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create index pms_match_id_idx on player_match_stats(match_id);
create index pms_player_id_idx on player_match_stats(player_id);

-- ----------------------------------------------------------------------------
-- CONFIGURAÇÕES GERAIS (linha única) — usada p/ apontar a partida em destaque
-- ----------------------------------------------------------------------------
create table tournament_settings (
  id int primary key default 1,
  featured_match_id uuid references matches(id),
  constraint single_row check (id = 1)
);
insert into tournament_settings (id) values (1);

-- ============================================================================
-- VIEWS DE LEITURA (usadas pelo site público)
-- ============================================================================

-- Estatísticas agregadas de cada jogador na temporada inteira
create or replace view player_season_stats as
select
  p.id as player_id,
  p.team_id,
  p.name,
  p.position,
  p.shirt_number,
  p.is_goalkeeper,
  count(pms.id) as appearances,
  coalesce(sum(pms.goals), 0) as goals,
  coalesce(sum(pms.assists), 0) as assists,
  round(avg(pms.rating), 2) as avg_rating,
  coalesce(sum(pms.yellow_cards), 0) as yellow_cards,
  coalesce(sum(pms.red_cards), 0) as red_cards
from players p
left join player_match_stats pms on pms.player_id = p.id
group by p.id;

-- Classificação da fase de grupos (só considera partidas finalizadas cuja
-- série está no estágio "grupos"; cada jogo da fase de grupos é MD1,
-- então 1 partida = 1 jogo de pontos corridos)
create or replace view group_standings as
with group_matches as (
  select m.*, s.team_home_id as s_home, s.team_away_id as s_away
  from matches m
  join series s on s.id = m.series_id
  where s.stage = 'grupos' and m.status = 'finalizado'
),
team_rows as (
  select
    team_home_id as team_id,
    home_score as gf,
    away_score as ga
  from group_matches
  union all
  select
    team_away_id as team_id,
    away_score as gf,
    home_score as ga
  from group_matches
)
select
  t.id as team_id,
  t.name,
  t.short_name,
  t.logo_url,
  t.group_name,
  count(tr.team_id) as played,
  count(*) filter (where tr.gf > tr.ga) as wins,
  count(*) filter (where tr.gf = tr.ga) as draws,
  count(*) filter (where tr.gf < tr.ga) as losses,
  coalesce(sum(tr.gf), 0) as goals_for,
  coalesce(sum(tr.ga), 0) as goals_against,
  coalesce(sum(tr.gf), 0) - coalesce(sum(tr.ga), 0) as goal_diff,
  coalesce(sum(case when tr.gf > tr.ga then 3 when tr.gf = tr.ga then 1 else 0 end), 0) as points
from teams t
left join team_rows tr on tr.team_id = t.id
group by t.id
order by points desc, goal_diff desc, goals_for desc;

-- ============================================================================
-- FUNÇÃO: atualizar o placar da série sempre que uma partida é finalizada
-- ============================================================================
create or replace function fn_update_series_after_match()
returns trigger as $$
declare
  v_series series%rowtype;
  v_home_wins int;
  v_away_wins int;
  v_needed int;
begin
  if new.status <> 'finalizado' then
    return new;
  end if;

  select * into v_series from series where id = new.series_id;

  select
    count(*) filter (
      where (m.team_home_id = v_series.team_home_id and coalesce(m.penalty_home_score, m.home_score) > coalesce(m.penalty_away_score, m.away_score))
         or (m.team_away_id = v_series.team_home_id and coalesce(m.penalty_away_score, m.away_score) > coalesce(m.penalty_home_score, m.home_score))
    ),
    count(*) filter (
      where (m.team_home_id = v_series.team_away_id and coalesce(m.penalty_home_score, m.home_score) > coalesce(m.penalty_away_score, m.away_score))
         or (m.team_away_id = v_series.team_away_id and coalesce(m.penalty_away_score, m.away_score) > coalesce(m.penalty_home_score, m.home_score))
    )
  into v_home_wins, v_away_wins
  from matches m
  where m.series_id = v_series.id and m.status = 'finalizado';

  v_needed := case v_series.format
    when 'MD1' then 1
    when 'MD3' then 2
    when 'MD5' then 3
    when 'MD7' then 4
  end;

  update series
  set team_home_wins = v_home_wins,
      team_away_wins = v_away_wins,
      winner_team_id = case
        when v_home_wins >= v_needed then v_series.team_home_id
        when v_away_wins >= v_needed then v_series.team_away_id
        else null
      end
  where id = v_series.id;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_series_after_match
after insert or update on matches
for each row
execute function fn_update_series_after_match();

-- ============================================================================
-- ROW LEVEL SECURITY
-- Leitura pública para todo mundo (site público). Escrita apenas para
-- usuários autenticados (o painel admin loga com Supabase Auth).
-- ============================================================================
alter table teams enable row level security;
alter table players enable row level security;
alter table series enable row level security;
alter table matches enable row level security;
alter table player_match_stats enable row level security;
alter table tournament_settings enable row level security;

create policy "public read teams" on teams for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read series" on series for select using (true);
create policy "public read matches" on matches for select using (true);
create policy "public read player_match_stats" on player_match_stats for select using (true);
create policy "public read tournament_settings" on tournament_settings for select using (true);

create policy "admin write teams" on teams for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write players" on players for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write series" on series for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write matches" on matches for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write player_match_stats" on player_match_stats for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write tournament_settings" on tournament_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================================
-- STORAGE — bucket público para os escudos dos times
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('team-logos', 'team-logos', true)
on conflict (id) do nothing;

create policy "public read team logos" on storage.objects
  for select using (bucket_id = 'team-logos');
create policy "admin upload team logos" on storage.objects
  for insert with check (bucket_id = 'team-logos' and auth.role() = 'authenticated');
create policy "admin update team logos" on storage.objects
  for update using (bucket_id = 'team-logos' and auth.role() = 'authenticated');
create policy "admin delete team logos" on storage.objects
  for delete using (bucket_id = 'team-logos' and auth.role() = 'authenticated');

-- ============================================================================
-- REALTIME — permite que o site público receba updates ao vivo
-- ============================================================================
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table player_match_stats;
alter publication supabase_realtime add table series;

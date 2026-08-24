// Tipos compartilhados — espelham as tabelas do Supabase (ver supabase/schema.sql)

export type MatchFormat = "MD1" | "MD3" | "MD5" | "MD7";

export type Stage =
  | "grupos"
  | "semifinal"
  | "final";

export type MatchStatus = "agendado" | "ao_vivo" | "finalizado" | "wo";

export interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  group_name: "A" | "B" | null;
  created_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  position: string | null;
  shirt_number: number | null;
  is_goalkeeper: boolean;
  photo_url: string | null;
  created_at: string;
}

// Estatísticas agregadas de um jogador (soma de todas as partidas)
export interface PlayerSeasonStats {
  player_id: string;
  appearances: number;
  goals: number;
  assists: number;
  avg_rating: number | null;
  yellow_cards: number;
  red_cards: number;
  clean_sheets: number;
}

// Estatística individual de UM jogador em UMA partida específica
export interface PlayerMatchStat {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  goals: number;
  assists: number;
  rating: number | null;
  yellow_cards: number;
  red_cards: number;
  saves: number | null;
  created_at: string;
}

// Uma "série" é o confronto entre dois times num formato MD1/3/5/7.
// Cada jogo individual dentro da série é uma linha em `matches`.
export interface Series {
  id: string;
  stage: Stage;
  format: MatchFormat;
  team_home_id: string;
  team_away_id: string;
  team_home_wins: number;
  team_away_wins: number;
  winner_team_id: string | null;
  round_label: string | null; // ex: "Semifinal 1", "Grande Final"
  created_at: string;
}

export interface Match {
  id: string;
  series_id: string;
  game_number: number; // jogo 1, 2, 3... dentro da série
  team_home_id: string;
  team_away_id: string;
  home_score: number | null;
  away_score: number | null;
  went_to_extra_time: boolean;
  penalty_home_score: number | null;
  penalty_away_score: number | null;
  status: MatchStatus;
  scheduled_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface GroupStanding {
  team_id: string;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

export interface MatchWithTeams extends Match {
  team_home: Team;
  team_away: Team;
  series: Series;
}

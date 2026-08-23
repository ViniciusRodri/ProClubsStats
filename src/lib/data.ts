import { createClient } from "@/lib/supabase/server";
import type {
  Team,
  Player,
  Match,
  Series,
  MatchWithTeams,
} from "@/lib/types";

export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teams")
    .select("*")
    .order("group_name")
    .order("name");
  return data ?? [];
}

export async function getTeam(id: string): Promise<Team | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("teams").select("*").eq("id", id).single();
  return data;
}

export async function getTeamRoster(teamId: string): Promise<Player[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .order("shirt_number", { ascending: true, nullsFirst: false });
  return data ?? [];
}

export async function getTeamPlayers(teamId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("player_season_stats")
    .select("*")
    .eq("team_id", teamId)
    .order("goals", { ascending: false });
  return data ?? [];
}

export async function getGroupStandings() {
  const supabase = await createClient();
  const { data } = await supabase.from("group_standings").select("*");
  const groupA = (data ?? []).filter((r) => r.group_name === "A");
  const groupB = (data ?? []).filter((r) => r.group_name === "B");
  return { groupA, groupB };
}

export async function getFeaturedMatch(): Promise<MatchWithTeams | null> {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("tournament_settings")
    .select("featured_match_id")
    .eq("id", 1)
    .single();

  let matchId = settings?.featured_match_id ?? null;

  if (!matchId) {
    const { data: liveMatch } = await supabase
      .from("matches")
      .select("id")
      .eq("status", "ao_vivo")
      .limit(1)
      .maybeSingle();
    matchId = liveMatch?.id ?? null;
  }

  if (!matchId) {
    const { data: next } = await supabase
      .from("matches")
      .select("id")
      .eq("status", "agendado")
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    matchId = next?.id ?? null;
  }

  if (!matchId) return null;

  const { data } = await supabase
    .from("matches")
    .select(
      "*, team_home:teams!matches_team_home_id_fkey(*), team_away:teams!matches_team_away_id_fkey(*), series:series(*)"
    )
    .eq("id", matchId)
    .single();

  return data as unknown as MatchWithTeams;
}

export async function getRecentResults(limit = 8): Promise<MatchWithTeams[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(
      "*, team_home:teams!matches_team_home_id_fkey(*), team_away:teams!matches_team_away_id_fkey(*), series:series(*)"
    )
    .eq("status", "finalizado")
    .order("finished_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as MatchWithTeams[];
}

export async function getUpcomingMatches(limit = 6): Promise<MatchWithTeams[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(
      "*, team_home:teams!matches_team_home_id_fkey(*), team_away:teams!matches_team_away_id_fkey(*), series:series(*)"
    )
    .eq("status", "agendado")
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .limit(limit);
  return (data ?? []) as unknown as MatchWithTeams[];
}

export async function getSeriesByStage(stage: Series["stage"]) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("series")
    .select(
      "*, team_home:teams!series_team_home_id_fkey(*), team_away:teams!series_team_away_id_fkey(*)"
    )
    .eq("stage", stage)
    .order("created_at");
  return data ?? [];
}

export async function getMatchesForSeries(seriesId: string): Promise<Match[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select("*")
    .eq("series_id", seriesId)
    .order("game_number");
  return data ?? [];
}

export async function getTopScorers(limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("player_season_stats")
    .select("*, team:teams(name, short_name, logo_url)")
    .order("goals", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getTopAssists(limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("player_season_stats")
    .select("*, team:teams(name, short_name, logo_url)")
    .order("assists", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getMatchById(id: string): Promise<MatchWithTeams | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(
      "*, team_home:teams!matches_team_home_id_fkey(*), team_away:teams!matches_team_away_id_fkey(*), series:series(*)"
    )
    .eq("id", id)
    .single();
  return data as unknown as MatchWithTeams | null;
}

export async function getMatchStats(matchId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("player_match_stats")
    .select("*, player:players(name, position, shirt_number, is_goalkeeper)")
    .eq("match_id", matchId)
    .order("goals", { ascending: false });
  return data ?? [];
}

export type { Player };

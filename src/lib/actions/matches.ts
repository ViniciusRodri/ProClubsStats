"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function salvarResultado(matchId: string, formData: FormData) {
  const supabase = await createClient();

  const home_score = Number(formData.get("home_score"));
  const away_score = Number(formData.get("away_score"));
  const went_to_extra_time = formData.get("went_to_extra_time") === "on";
  const penHomeRaw = String(formData.get("penalty_home_score") ?? "").trim();
  const penAwayRaw = String(formData.get("penalty_away_score") ?? "").trim();

  const { error } = await supabase
    .from("matches")
    .update({
      home_score,
      away_score,
      went_to_extra_time,
      penalty_home_score: penHomeRaw ? Number(penHomeRaw) : null,
      penalty_away_score: penAwayRaw ? Number(penAwayRaw) : null,
      status: "finalizado",
      finished_at: new Date().toISOString(),
    })
    .eq("id", matchId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/resultados");
  revalidatePath(`/admin/resultados/${matchId}`);
  revalidatePath("/resultados");
  revalidatePath(`/resultados/${matchId}`);
  revalidatePath("/classificacao");
  revalidatePath("/chaveamento");
  revalidatePath("/artilharia");
  revalidatePath("/times");
  revalidatePath("/", "layout");
}

export async function registrarWO(matchId: string, vencedorTeamId: string) {
  const supabase = await createClient();

  const { data: match, error } = await supabase.from("matches").select("*, series:series(*)").eq("id", matchId).single();
  if (error) throw new Error(error.message);

  const isHomeWinner = vencedorTeamId === match.team_home_id;
  const homeScore = isHomeWinner ? (match.series.format === "MD7" ? 4 : match.series.format === "MD3" ? 2 : 1) : 0;
  const awayScore = isHomeWinner ? 0 : match.series.format === "MD7" ? 4 : match.series.format === "MD3" ? 2 : 1;

  const { error: updateErr } = await supabase
    .from("matches")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: "wo",
      finished_at: new Date().toISOString(),
    })
    .eq("id", matchId);
  if (updateErr) throw new Error(updateErr.message);

  revalidatePath("/admin/resultados");
  revalidatePath("/resultados");
  revalidatePath("/classificacao");
  revalidatePath("/chaveamento");
}

export async function salvarEstatisticaJogador(
  matchId: string,
  teamId: string,
  playerId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const goals = Number(formData.get("goals") ?? 0);
  const assists = Number(formData.get("assists") ?? 0);
  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const yellow_cards = Number(formData.get("yellow_cards") ?? 0);
  const red_cards = Number(formData.get("red_cards") ?? 0);
  const savesRaw = String(formData.get("saves") ?? "").trim();

  const { error } = await supabase.from("player_match_stats").upsert(
    {
      match_id: matchId,
      team_id: teamId,
      player_id: playerId,
      goals,
      assists,
      rating: ratingRaw ? Number(ratingRaw) : null,
      yellow_cards,
      red_cards,
      saves: savesRaw ? Number(savesRaw) : null,
    },
    { onConflict: "match_id,player_id" }
  );
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/resultados/${matchId}`);
  revalidatePath(`/resultados/${matchId}`);
  revalidatePath("/artilharia");
  revalidatePath("/times");
  revalidatePath("/");
}

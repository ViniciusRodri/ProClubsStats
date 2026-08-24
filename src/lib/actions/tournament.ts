"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MatchFormat } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pairs<T>(items: T[]): [T, T][] {
  const out: [T, T][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      out.push([items[i], items[j]]);
    }
  }
  return out;
}

// Em produção o Next.js esconde a mensagem real de qualquer erro lançado
// dentro de uma Server Action (por segurança). Por isso, em vez de `throw`,
// essas ações redirecionam de volta para a página com a mensagem de erro
// de verdade na URL (?erro=...), que a página lê e mostra num aviso.
function falhar(path: string, message: string): never {
  redirect(`${path}?erro=${encodeURIComponent(message)}`);
}

/** Sorteia os 8 times em Grupo A / Grupo B e gera os confrontos (turno único) da fase de grupos. */
export async function sortearGrupos() {
  const supabase = await createClient();

  const { data: teams, error } = await supabase.from("teams").select("id, name");
  if (error) falhar("/admin/confrontos", error.message);
  if (!teams || teams.length !== 8) {
    falhar(
      "/admin/confrontos",
      `É preciso ter exatamente 8 times cadastrados (atual: ${teams?.length ?? 0}).`
    );
  }

  // Limpa sorteio anterior da fase de grupos, se houver.
  const { data: oldSeries } = await supabase.from("series").select("id").eq("stage", "grupos");
  if (oldSeries && oldSeries.length > 0) {
    await supabase.from("series").delete().eq("stage", "grupos");
  }

  const shuffled = shuffle(teams);
  const groupA = shuffled.slice(0, 4);
  const groupB = shuffled.slice(4, 8);

  await Promise.all([
    ...groupA.map((t) => supabase.from("teams").update({ group_name: "A" }).eq("id", t.id)),
    ...groupB.map((t) => supabase.from("teams").update({ group_name: "B" }).eq("id", t.id)),
  ]);

  const fixtures = [
    ...pairs(groupA).map((p) => ({ pair: p, label: "Fase de Grupos - Grupo A" })),
    ...pairs(groupB).map((p) => ({ pair: p, label: "Fase de Grupos - Grupo B" })),
  ];

  for (const fx of fixtures) {
    const { data: series, error: seriesErr } = await supabase
      .from("series")
      .insert({
        stage: "grupos",
        format: "MD1" as MatchFormat,
        team_home_id: fx.pair[0].id,
        team_away_id: fx.pair[1].id,
        round_label: fx.label,
      })
      .select()
      .single();
    if (seriesErr) falhar("/admin/confrontos", seriesErr.message);

    await supabase.from("matches").insert({
      series_id: series.id,
      game_number: 1,
      team_home_id: fx.pair[0].id,
      team_away_id: fx.pair[1].id,
      status: "agendado",
    });
  }

  revalidatePath("/admin/confrontos");
  revalidatePath("/classificacao");
  revalidatePath("/times");
  revalidatePath("/");
}

/** Gera as duas semifinais (MD3) a partir da classificação atual dos grupos. */
export async function gerarSemifinais() {
  const supabase = await createClient();

  const { data: standings, error } = await supabase.from("group_standings").select("*");
  if (error) falhar("/admin/confrontos", error.message);

  const groupA = (standings ?? []).filter((r) => r.group_name === "A");
  const groupB = (standings ?? []).filter((r) => r.group_name === "B");

  if (groupA.length < 2 || groupB.length < 2) {
    falhar(
      "/admin/confrontos",
      "Classificação incompleta. Finalize a fase de grupos antes de gerar as semifinais."
    );
  }

  const { data: existing } = await supabase.from("series").select("id").eq("stage", "semifinal");
  if (existing && existing.length > 0) {
    falhar("/admin/confrontos", "As semifinais já foram geradas.");
  }

  const fixtures = [
    { home: groupA[0], away: groupB[1], label: "Semifinal 1" },
    { home: groupB[0], away: groupA[1], label: "Semifinal 2" },
  ];

  for (const fx of fixtures) {
    const { error: insertErr } = await supabase.from("series").insert({
      stage: "semifinal",
      format: "MD3" as MatchFormat,
      team_home_id: fx.home.team_id,
      team_away_id: fx.away.team_id,
      round_label: fx.label,
    });
    if (insertErr) falhar("/admin/confrontos", insertErr.message);
  }

  revalidatePath("/admin/confrontos");
  revalidatePath("/chaveamento");
}

/** Gera a Grande Final (MD7) a partir dos vencedores das semifinais. */
export async function gerarFinal() {
  const supabase = await createClient();

  const { data: semis, error } = await supabase
    .from("series")
    .select("*")
    .eq("stage", "semifinal");
  if (error) falhar("/admin/confrontos", error.message);

  if (!semis || semis.length < 2 || semis.some((s) => !s.winner_team_id)) {
    falhar("/admin/confrontos", "As duas semifinais precisam estar concluídas antes de gerar a final.");
  }

  const { data: existing } = await supabase.from("series").select("id").eq("stage", "final");
  if (existing && existing.length > 0) {
    falhar("/admin/confrontos", "A Grande Final já foi gerada.");
  }

  const { error: insertErr } = await supabase.from("series").insert({
    stage: "final",
    format: "MD7" as MatchFormat,
    team_home_id: semis[0].winner_team_id,
    team_away_id: semis[1].winner_team_id,
    round_label: "Grande Final",
  });
  if (insertErr) falhar("/admin/confrontos", insertErr.message);

  revalidatePath("/admin/confrontos");
  revalidatePath("/chaveamento");
}

/** Adiciona o próximo jogo de uma série (ex: jogo 2 de uma MD3). */
export async function adicionarJogoNaSerie(seriesId: string) {
  const supabase = await createClient();

  const { data: series, error } = await supabase.from("series").select("*").eq("id", seriesId).single();
  if (error) falhar("/admin/confrontos", error.message);

  const maxGames = { MD1: 1, MD3: 3, MD5: 5, MD7: 7 }[series.format as MatchFormat];

  const { data: existingMatches } = await supabase
    .from("matches")
    .select("game_number")
    .eq("series_id", seriesId)
    .order("game_number", { ascending: false })
    .limit(1);

  const nextGame = (existingMatches?.[0]?.game_number ?? 0) + 1;
  if (nextGame > maxGames) {
    falhar("/admin/confrontos", `A série ${series.format} já atingiu o número máximo de jogos.`);
  }

  const { error: insertErr } = await supabase.from("matches").insert({
    series_id: seriesId,
    game_number: nextGame,
    team_home_id: series.team_home_id,
    team_away_id: series.team_away_id,
    status: "agendado",
  });
  if (insertErr) falhar("/admin/confrontos", insertErr.message);

  revalidatePath("/admin/confrontos");
  revalidatePath("/admin/resultados");
  revalidatePath("/chaveamento");
  revalidatePath("/resultados");
}

/** Marca uma partida como "ao vivo" (e destaca ela na home) — remove o status ao vivo de qualquer outra. */
export async function marcarComoAoVivo(matchId: string) {
  const supabase = await createClient();

  await supabase.from("matches").update({ status: "agendado" }).eq("status", "ao_vivo");

  const { error } = await supabase
    .from("matches")
    .update({ status: "ao_vivo", started_at: new Date().toISOString() })
    .eq("id", matchId);
  if (error) falhar(`/admin/resultados/${matchId}`, error.message);

  await supabase.from("tournament_settings").update({ featured_match_id: matchId }).eq("id", 1);

  revalidatePath("/", "layout");
}

/** Exclui um confronto (série) inteiro, junto com todas as partidas e estatísticas dele. */
export async function excluirSerie(seriesId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("series").delete().eq("id", seriesId);
  if (error) falhar("/admin/confrontos", error.message);

  revalidatePath("/admin/confrontos");
  revalidatePath("/admin/resultados");
  revalidatePath("/chaveamento");
  revalidatePath("/resultados");
  revalidatePath("/classificacao");
  revalidatePath("/", "layout");
}

/** Exclui apenas um jogo específico dentro de uma série (ex: refazer o jogo 2 de uma MD3). */
export async function excluirPartida(matchId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) falhar("/admin/confrontos", error.message);

  revalidatePath("/admin/confrontos");
  revalidatePath("/admin/resultados");
  revalidatePath("/chaveamento");
  revalidatePath("/resultados");
  revalidatePath("/classificacao");
  revalidatePath("/", "layout");
}

/** Edita os times de um confronto e/ou o rótulo (ex: corrigir um sorteio errado). */
export async function editarConfronto(seriesId: string, formData: FormData) {
  const supabase = await createClient();

  const team_home_id = String(formData.get("team_home_id") ?? "");
  const team_away_id = String(formData.get("team_away_id") ?? "");
  const round_label = String(formData.get("round_label") ?? "").trim() || null;

  if (!team_home_id || !team_away_id) {
    falhar("/admin/confrontos", "Selecione os dois times do confronto.");
  }
  if (team_home_id === team_away_id) {
    falhar("/admin/confrontos", "Os dois times do confronto não podem ser o mesmo time.");
  }

  const { error: seriesErr } = await supabase
    .from("series")
    .update({ team_home_id, team_away_id, round_label })
    .eq("id", seriesId);
  if (seriesErr) falhar("/admin/confrontos", seriesErr.message);

  // Mantém as partidas já criadas dessa série alinhadas com os novos times,
  // apenas para os jogos que ainda não têm placar lançado.
  const { error: matchesErr } = await supabase
    .from("matches")
    .update({ team_home_id, team_away_id })
    .eq("series_id", seriesId)
    .is("home_score", null);
  if (matchesErr) falhar("/admin/confrontos", matchesErr.message);

  revalidatePath("/admin/confrontos");
  revalidatePath("/admin/resultados");
  revalidatePath("/chaveamento");
  revalidatePath("/resultados");
  revalidatePath("/", "layout");
}

/** Define manualmente qual partida aparece em destaque na home (sem alterar o status). */
export async function definirPartidaEmDestaque(matchId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tournament_settings")
    .update({ featured_match_id: matchId })
    .eq("id", 1);
  if (error) falhar(`/admin/resultados/${matchId}`, error.message);
  revalidatePath("/", "layout");
}
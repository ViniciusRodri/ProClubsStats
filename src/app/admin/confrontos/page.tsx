import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { TeamCrest } from "@/components/site/team-crest";
import { Panel, FormatBadge, StatusBadge } from "@/components/ui/primitives";
import { getSeriesByStage, getMatchesForSeries, getTeams } from "@/lib/data";
import {
  sortearGrupos,
  gerarSemifinais,
  gerarFinal,
  adicionarJogoNaSerie,
  excluirSerie,
  excluirPartida,
  editarConfronto,
} from "@/lib/actions/tournament";
import type { Team } from "@/lib/types";

async function SeriesBlock({
  stage,
  teams,
}: {
  stage: "grupos" | "semifinal" | "final";
  teams: Team[];
}) {
  const series = await getSeriesByStage(stage);
  if (series.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {await Promise.all(
        series.map(async (s) => {
          const matches = await getMatchesForSeries(s.id);
          const maxGames = { MD1: 1, MD3: 3, MD5: 5, MD7: 7 }[s.format as "MD1" | "MD3" | "MD5" | "MD7"];
          const canAddGame = matches.length < maxGames && !s.winner_team_id;
          const hasResults = matches.some((m) => m.home_score !== null);

          return (
            <Panel key={s.id} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-steel-dim">
                  {s.round_label}
                </span>
                <div className="flex items-center gap-2">
                  <FormatBadge format={s.format} />
                  <form
                    action={async () => {
                      "use server";
                      await excluirSerie(s.id);
                    }}
                  >
                    <button
                      className="rounded-md border border-navy-700 p-1 text-steel hover:border-loss/50 hover:text-loss"
                      title="Excluir confronto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TeamCrest name={s.team_home.name} logoUrl={s.team_home.logo_url} size={22} />
                  <span className="text-ivory">{s.team_home.name}</span>
                </div>
                <span className="stat-num text-steel">{s.team_home_wins}</span>
              </div>
              <div className="mb-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TeamCrest name={s.team_away.name} logoUrl={s.team_away.logo_url} size={22} />
                  <span className="text-ivory">{s.team_away.name}</span>
                </div>
                <span className="stat-num text-steel">{s.team_away_wins}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 border-t border-navy-700/60 pt-3">
                {matches.map((m) => (
                  <div key={m.id} className="flex items-center gap-1">
                    <Link
                      href={`/admin/resultados/${m.id}`}
                      className="flex items-center gap-1 rounded-md border border-navy-700 bg-navy-800 px-2 py-1 text-[11px] text-steel hover:border-gold-500/40 hover:text-gold-400"
                    >
                      <StatusBadge status={m.status} />
                      <span className="stat-num">
                        {m.home_score ?? "-"}-{m.away_score ?? "-"}
                      </span>
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await excluirPartida(m.id);
                      }}
                    >
                      <button
                        className="rounded-md border border-navy-700 p-1 text-steel-dim hover:border-loss/50 hover:text-loss"
                        title={`Excluir jogo ${m.game_number}`}
                      >
                        <Trash2 size={11} />
                      </button>
                    </form>
                  </div>
                ))}
                {canAddGame && (
                  <form action={adicionarJogoNaSerie.bind(null, s.id)}>
                    <button className="flex items-center gap-1 rounded-md border border-dashed border-gold-500/30 px-2 py-1 text-[11px] text-gold-400 hover:bg-gold-500/10">
                      <Plus size={12} /> Jogo {matches.length + 1}
                    </button>
                  </form>
                )}
              </div>

              {!hasResults && (
                <details className="mt-3 border-t border-navy-700/60 pt-3">
                  <summary className="cursor-pointer text-[11px] font-medium text-steel-dim hover:text-gold-400">
                    Editar confronto (trocar times)
                  </summary>
                  <form action={editarConfronto.bind(null, s.id)} className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        name="team_home_id"
                        defaultValue={s.team_home_id}
                        className="rounded-md border border-navy-700 bg-navy-800 px-2 py-1.5 text-xs text-ivory outline-none focus:border-gold-500/60"
                      >
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <select
                        name="team_away_id"
                        defaultValue={s.team_away_id}
                        className="rounded-md border border-navy-700 bg-navy-800 px-2 py-1.5 text-xs text-ivory outline-none focus:border-gold-500/60"
                      >
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      name="round_label"
                      defaultValue={s.round_label ?? ""}
                      placeholder="Rótulo (ex: Semifinal 1)"
                      className="w-full rounded-md border border-navy-700 bg-navy-800 px-2 py-1.5 text-xs text-ivory outline-none focus:border-gold-500/60"
                    />
                    <button className="w-full rounded-md border border-gold-500/30 py-1.5 text-xs font-medium text-gold-400 hover:bg-gold-500/10">
                      Salvar alteração
                    </button>
                  </form>
                </details>
              )}
            </Panel>
          );
        })
      )}
    </div>
  );
}

export default async function AdminConfrontosPage() {
  const teams = await getTeams();

  return (
    <div className="space-y-10">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.28em] text-gold-500">Chaveamento</p>
        <h1 className="font-display text-2xl font-bold text-ivory">Confrontos</h1>
      </div>

      <Panel className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ivory">1. Sortear grupos e fase de grupos</p>
          <p className="mt-1 text-xs text-steel-dim">
            Requer exatamente 8 times cadastrados. Sorteia Grupo A/B e cria os confrontos (turno único, MD1).
            Rodar de novo substitui o sorteio anterior da fase de grupos.
          </p>
        </div>
        <form action={sortearGrupos}>
          <button className="whitespace-nowrap rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400">
            Sortear grupos
          </button>
        </form>
      </Panel>

      <div>
        <p className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-gold-400">
          Fase de grupos
        </p>
        <SeriesBlock stage="grupos" teams={teams} />
      </div>

      <Panel className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ivory">2. Gerar semifinais (MD3)</p>
          <p className="mt-1 text-xs text-steel-dim">
            1ºA x 2ºB e 1ºB x 2ºA, conforme a classificação atual dos grupos.
          </p>
        </div>
        <form action={gerarSemifinais}>
          <button className="whitespace-nowrap rounded-lg border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">
            Gerar semifinais
          </button>
        </form>
      </Panel>

      <div>
        <p className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-gold-400">
          Semifinais
        </p>
        <SeriesBlock stage="semifinal" teams={teams} />
      </div>

      <Panel className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ivory">3. Gerar Grande Final (MD7)</p>
          <p className="mt-1 text-xs text-steel-dim">Vencedor da Semifinal 1 x vencedor da Semifinal 2.</p>
        </div>
        <form action={gerarFinal}>
          <button className="whitespace-nowrap rounded-lg border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">
            Gerar final
          </button>
        </form>
      </Panel>

      <div>
        <p className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-gold-400">
          Grande Final
        </p>
        <SeriesBlock stage="final" teams={teams} />
      </div>
    </div>
  );
}
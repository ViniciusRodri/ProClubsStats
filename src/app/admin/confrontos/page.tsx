import Link from "next/link";
import { Plus } from "lucide-react";
import { TeamCrest } from "@/components/site/team-crest";
import { Panel, FormatBadge, StatusBadge } from "@/components/ui/primitives";
import { getSeriesByStage, getMatchesForSeries } from "@/lib/data";
import {
  sortearGrupos,
  gerarSemifinais,
  gerarFinal,
  adicionarJogoNaSerie,
  marcarComoAoVivo,
} from "@/lib/actions/tournament";

async function SeriesBlock({ stage }: { stage: "grupos" | "semifinal" | "final" }) {
  const series = await getSeriesByStage(stage);
  if (series.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {await Promise.all(
        series.map(async (s) => {
          const matches = await getMatchesForSeries(s.id);
          const maxGames = { MD1: 1, MD3: 3, MD5: 5, MD7: 7 }[s.format as "MD1" | "MD3" | "MD5" | "MD7"];
          const canAddGame = matches.length < maxGames && !s.winner_team_id;

          return (
            <Panel key={s.id} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-steel-dim">
                  {s.round_label}
                </span>
                <FormatBadge format={s.format} />
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
                  <Link
                    key={m.id}
                    href={`/admin/resultados/${m.id}`}
                    className="flex items-center gap-1 rounded-md border border-navy-700 bg-navy-800 px-2 py-1 text-[11px] text-steel hover:border-gold-500/40 hover:text-gold-400"
                  >
                    <StatusBadge status={m.status} />
                    <span className="stat-num">
                      {m.home_score ?? "-"}-{m.away_score ?? "-"}
                    </span>
                  </Link>
                ))}
                {canAddGame && (
                  <form action={adicionarJogoNaSerie.bind(null, s.id)}>
                    <button className="flex items-center gap-1 rounded-md border border-dashed border-gold-500/30 px-2 py-1 text-[11px] text-gold-400 hover:bg-gold-500/10">
                      <Plus size={12} /> Jogo {matches.length + 1}
                    </button>
                  </form>
                )}
              </div>
            </Panel>
          );
        })
      )}
    </div>
  );
}

export default async function AdminConfrontosPage() {
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
        <SeriesBlock stage="grupos" />
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
        <SeriesBlock stage="semifinal" />
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
        <SeriesBlock stage="final" />
      </div>
    </div>
  );
}

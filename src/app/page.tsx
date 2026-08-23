import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeaturedMatch } from "@/components/site/featured-match";
import { MatchLine } from "@/components/site/match-line";
import { TeamCrest } from "@/components/site/team-crest";
import { Panel, SectionTitle, Eyebrow } from "@/components/ui/primitives";
import {
  getFeaturedMatch,
  getRecentResults,
  getGroupStandings,
  getTopScorers,
} from "@/lib/data";

export const revalidate = 30;

export default async function HomePage() {
  const [featured, recent, standings, scorers] = await Promise.all([
    getFeaturedMatch(),
    getRecentResults(5),
    getGroupStandings(),
    getTopScorers(5),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 space-y-16">
      {/* Hero */}
      <section>
        <div className="mb-6 text-center">
          <Eyebrow>EA FC 26 · Est. 2024</Eyebrow>
          <h1 className="font-display mt-2 text-3xl font-bold uppercase tracking-wide text-ivory sm:text-4xl">
            Campeonato Pro Clubs
          </h1>
          <p className="mt-2 text-sm text-steel">
            8 clubes. 2 grupos. Um caminho até a Grande Final em MD7.
          </p>
        </div>
        <FeaturedMatch match={featured} />
      </section>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Standings preview */}
        <section className="lg:col-span-3">
          <SectionTitle
            eyebrow="Fase de grupos"
            title="Classificação"
            description="Os dois primeiros de cada grupo avançam direto para as semifinais."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { label: "Grupo A", rows: standings.groupA },
              { label: "Grupo B", rows: standings.groupB },
            ].map((group) => (
              <Panel key={group.label} className="overflow-hidden">
                <div className="border-b border-gold-500/15 px-4 py-3">
                  <p className="font-display text-sm font-semibold uppercase tracking-wider text-gold-400">
                    {group.label}
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-steel-dim">
                      <th className="px-4 py-2 text-left font-medium">Time</th>
                      <th className="px-2 py-2 text-center font-medium">J</th>
                      <th className="px-2 py-2 text-center font-medium">SG</th>
                      <th className="px-3 py-2 text-center font-medium">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-steel-dim">
                          Sem partidas ainda.
                        </td>
                      </tr>
                    )}
                    {group.rows.map((row, i) => (
                      <tr
                        key={row.team_id}
                        className={`border-t border-navy-700/60 ${
                          i < 2 ? "bg-gold-500/5" : ""
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <TeamCrest name={row.name} logoUrl={row.logo_url} size={22} />
                            <span className="truncate text-ivory">{row.name}</span>
                          </div>
                        </td>
                        <td className="stat-num px-2 py-2.5 text-center text-steel">
                          {row.played}
                        </td>
                        <td className="stat-num px-2 py-2.5 text-center text-steel">
                          {row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}
                        </td>
                        <td className="stat-num px-3 py-2.5 text-center font-semibold text-gold-400">
                          {row.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            ))}
          </div>
          <Link
            href="/classificacao"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-400 hover:text-gold-500"
          >
            Ver classificação completa <ArrowRight size={15} />
          </Link>
        </section>

        {/* Top scorers */}
        <section className="lg:col-span-2">
          <SectionTitle eyebrow="Individual" title="Artilharia" />
          <Panel>
            <ul className="divide-y divide-navy-700/60">
              {scorers.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-steel-dim">
                  As estatísticas aparecem assim que as partidas forem registradas.
                </li>
              )}
              {scorers.map((p, i) => (
                <li key={p.player_id} className="flex items-center gap-3 px-4 py-3">
                  <span className="stat-num w-4 text-sm text-steel-dim">{i + 1}</span>
                  <TeamCrest
                    name={p.team?.name ?? ""}
                    logoUrl={p.team?.logo_url}
                    size={24}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-ivory">{p.name}</p>
                    <p className="truncate text-xs text-steel-dim">{p.team?.short_name ?? p.team?.name}</p>
                  </div>
                  <span className="stat-num text-lg font-semibold text-gold-400">
                    {p.goals}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
          <Link
            href="/artilharia"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-400 hover:text-gold-500"
          >
            Ver artilharia e assistências <ArrowRight size={15} />
          </Link>
        </section>
      </div>

      {/* Recent results */}
      <section>
        <SectionTitle eyebrow="Últimas partidas" title="Resultados recentes" />
        <Panel>
          <div className="divide-y divide-navy-700/60">
            {recent.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-steel-dim">
                Nenhuma partida finalizada até o momento.
              </p>
            )}
            {recent.map((m) => (
              <MatchLine key={m.id} match={m} />
            ))}
          </div>
        </Panel>
        <Link
          href="/resultados"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-400 hover:text-gold-500"
        >
          Ver todos os resultados <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}

import { notFound } from "next/navigation";
import { FeaturedMatch } from "@/components/site/featured-match";
import { TeamCrest } from "@/components/site/team-crest";
import { Panel, SectionTitle } from "@/components/ui/primitives";
import { getMatchById, getMatchStats } from "@/lib/data";

export const revalidate = 15;

export default async function MatchDetailPage({
  params,
}: PageProps<"/resultados/[id]">) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();

  const stats = await getMatchStats(id);
  const homeStats = stats.filter((s) => s.team_id === match.team_home_id);
  const awayStats = stats.filter((s) => s.team_id === match.team_away_id);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 space-y-10">
      <FeaturedMatch match={match} />

      {(homeStats.length > 0 || awayStats.length > 0) && (
        <div>
          <SectionTitle eyebrow="Nesta partida" title="Estatísticas individuais" />
          <div className="grid gap-6 sm:grid-cols-2">
            <TeamStatTable name={match.team_home.name} logo={match.team_home.logo_url} rows={homeStats} />
            <TeamStatTable name={match.team_away.name} logo={match.team_away.logo_url} rows={awayStats} />
          </div>
        </div>
      )}
    </div>
  );
}

function TeamStatTable({
  name,
  logo,
  rows,
}: {
  name: string;
  logo: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[];
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-gold-500/15 px-4 py-3">
        <TeamCrest name={name} logoUrl={logo} size={22} />
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-ivory">
          {name}
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-steel-dim">
            <th className="px-4 py-2 text-left font-medium">Jogador</th>
            <th className="px-2 py-2 text-center font-medium">G</th>
            <th className="px-2 py-2 text-center font-medium">A</th>
            <th className="px-2 py-2 text-center font-medium">Nota</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-center text-steel-dim">
                Sem estatísticas registradas.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-navy-700/60">
              <td className="px-4 py-2.5 text-ivory">{r.player?.name}</td>
              <td className="stat-num px-2 py-2.5 text-center text-steel">{r.goals}</td>
              <td className="stat-num px-2 py-2.5 text-center text-steel">{r.assists}</td>
              <td className="stat-num px-2 py-2.5 text-center font-semibold text-gold-400">
                {r.rating ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

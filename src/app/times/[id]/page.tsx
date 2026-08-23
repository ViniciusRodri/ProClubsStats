import { notFound } from "next/navigation";
import { TeamCrest } from "@/components/site/team-crest";
import { Panel, Eyebrow } from "@/components/ui/primitives";
import { getTeam, getTeamPlayers } from "@/lib/data";

export const revalidate = 60;

export default async function TeamDetailPage({
  params,
}: PageProps<"/times/[id]">) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  const players = await getTeamPlayers(id);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 space-y-8">
      <div className="flex items-center gap-5">
        <TeamCrest name={team.name} logoUrl={team.logo_url} size={72} />
        <div>
          {team.group_name && <Eyebrow>Grupo {team.group_name}</Eyebrow>}
          <h1 className="font-display text-2xl font-bold text-ivory sm:text-3xl">
            {team.name}
          </h1>
        </div>
      </div>

      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-steel-dim">
              <th className="px-4 py-3 text-left font-medium">Jogador</th>
              <th className="px-2 py-3 text-left font-medium">Posição</th>
              <th className="px-2 py-3 text-center font-medium">J</th>
              <th className="px-2 py-3 text-center font-medium">G</th>
              <th className="px-2 py-3 text-center font-medium">A</th>
              <th className="px-2 py-3 text-center font-medium">Nota</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-steel-dim">
                  Nenhum jogador cadastrado para este time.
                </td>
              </tr>
            )}
            {players.map((p) => (
              <tr key={p.player_id} className="border-t border-navy-700/60">
                <td className="px-4 py-3 font-medium text-ivory">
                  {p.shirt_number != null && (
                    <span className="stat-num mr-2 text-steel-dim">#{p.shirt_number}</span>
                  )}
                  {p.name}
                  {p.is_goalkeeper && (
                    <span className="ml-2 rounded border border-gold-500/25 px-1.5 py-0.5 text-[10px] text-gold-400">
                      GOL
                    </span>
                  )}
                </td>
                <td className="px-2 py-3 text-steel">{p.position ?? "-"}</td>
                <td className="stat-num px-2 py-3 text-center text-steel">{p.appearances}</td>
                <td className="stat-num px-2 py-3 text-center font-semibold text-gold-400">
                  {p.goals}
                </td>
                <td className="stat-num px-2 py-3 text-center text-steel">{p.assists}</td>
                <td className="stat-num px-2 py-3 text-center text-steel">
                  {p.avg_rating ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

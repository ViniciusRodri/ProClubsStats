import { notFound } from "next/navigation";
import { TeamCrest } from "@/components/site/team-crest";
import { PlayerPhoto } from "@/components/site/player-photo";
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
    <div className="mx-auto max-w-5xl px-5 py-10 space-y-8">
      <div className="flex items-center gap-5">
        <TeamCrest name={team.name} logoUrl={team.logo_url} size={72} />
        <div>
          {team.group_name && <Eyebrow>Grupo {team.group_name}</Eyebrow>}
          <h1 className="font-display text-2xl font-bold text-ivory sm:text-3xl">
            {team.name}
          </h1>
        </div>
      </div>

      {players.length === 0 ? (
        <Panel className="px-4 py-10 text-center text-sm text-steel-dim">
          Nenhum jogador cadastrado para este time.
        </Panel>
      ) : (
        <div>
          <p className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-gold-400">
            Elenco
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {players.map((p) => (
              <Panel key={p.player_id} className="overflow-hidden">
                <div className="relative aspect-square w-full">
                  <PlayerPhoto
                    name={p.name}
                    photoUrl={p.photo_url}
                    size={240}
                    className="h-full w-full"
                  />
                  {p.shirt_number != null && (
                    <span className="stat-num absolute left-2 top-2 rounded-md bg-navy-950/80 px-2 py-0.5 text-xs font-semibold text-gold-400">
                      #{p.shirt_number}
                    </span>
                  )}
                  {p.is_goalkeeper && (
                    <span className="absolute right-2 top-2 rounded-md bg-navy-950/80 px-2 py-0.5 text-[10px] font-semibold text-gold-400">
                      GOL
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-display text-sm font-semibold text-ivory">
                    {p.name}
                  </p>
                  <p className="mb-2.5 truncate text-[11px] text-steel-dim">
                    {p.position ?? "—"}
                  </p>
                  <div className="grid grid-cols-4 gap-1 border-t border-navy-700/60 pt-2 text-center">
                    <div>
                      <p className="stat-num text-sm font-semibold text-gold-400">{p.goals}</p>
                      <p className="text-[9px] uppercase tracking-wider text-steel-dim">Gols</p>
                    </div>
                    <div>
                      <p className="stat-num text-sm font-semibold text-ivory">{p.assists}</p>
                      <p className="text-[9px] uppercase tracking-wider text-steel-dim">Assist.</p>
                    </div>
                    <div>
                      <p className="stat-num text-sm font-semibold text-ivory">
                        {p.yellow_cards}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-steel-dim">CA</p>
                    </div>
                    <div>
                      <p className="stat-num text-sm font-semibold text-loss">{p.red_cards}</p>
                      <p className="text-[9px] uppercase tracking-wider text-steel-dim">CV</p>
                    </div>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
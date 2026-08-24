import { notFound } from "next/navigation";
import { TeamCrest } from "@/components/site/team-crest";
import { Panel, StatusBadge, FormatBadge } from "@/components/ui/primitives";
import { getMatchById, getMatchStats, getTeamRoster } from "@/lib/data";
import { marcarComoAoVivo, definirPartidaEmDestaque } from "@/lib/actions/tournament";
import { salvarResultado, registrarWO, salvarEstatisticaJogador } from "@/lib/actions/matches";

export default async function AdminMatchPage({
  params,
  searchParams,
}: PageProps<"/admin/resultados/[matchId]">) {
  const { matchId } = await params;
  const { erro } = await searchParams;
  const match = await getMatchById(matchId);
  if (!match) notFound();

  const [homeRoster, awayRoster, stats] = await Promise.all([
    getTeamRoster(match.team_home_id),
    getTeamRoster(match.team_away_id),
    getMatchStats(matchId),
  ]);

  const statByPlayer = new Map(stats.map((s) => [s.player_id, s]));

  return (
    <div className="space-y-8">
      {erro && (
        <div className="rounded-xl border border-loss/30 bg-loss/10 px-4 py-3 text-sm text-loss">
          {Array.isArray(erro) ? erro[0] : erro}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={match.status} />
        <FormatBadge format={match.series.format} />
        <span className="text-xs text-steel-dim">
          {match.series.round_label} · Jogo {match.game_number}
        </span>
      </div>

      <Panel className="p-6">
        <div className="mb-5 flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <TeamCrest name={match.team_home.name} logoUrl={match.team_home.logo_url} size={48} />
            <span className="text-sm font-medium text-ivory">{match.team_home.name}</span>
          </div>
          <span className="font-display text-xl text-steel-dim">vs</span>
          <div className="flex flex-col items-center gap-2">
            <TeamCrest name={match.team_away.name} logoUrl={match.team_away.logo_url} size={48} />
            <span className="text-sm font-medium text-ivory">{match.team_away.name}</span>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap justify-center gap-3">
          <form action={marcarComoAoVivo.bind(null, matchId)}>
            <button className="rounded-lg border border-live/40 bg-live/10 px-3 py-1.5 text-xs font-semibold text-live hover:bg-live/20">
              Marcar como ao vivo
            </button>
          </form>
          <form action={definirPartidaEmDestaque.bind(null, matchId)}>
            <button className="rounded-lg border border-gold-500/30 px-3 py-1.5 text-xs font-semibold text-gold-400 hover:bg-gold-500/10">
              Destacar na home
            </button>
          </form>
        </div>

        <form action={salvarResultado.bind(null, matchId)} className="mx-auto max-w-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-steel">Placar {match.team_home.name}</label>
              <input
                name="home_score"
                type="number"
                min={0}
                required
                defaultValue={match.home_score ?? ""}
                className="stat-num w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-center text-lg text-ivory outline-none focus:border-gold-500/60"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-steel">Placar {match.team_away.name}</label>
              <input
                name="away_score"
                type="number"
                min={0}
                required
                defaultValue={match.away_score ?? ""}
                className="stat-num w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-center text-lg text-ivory outline-none focus:border-gold-500/60"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-steel">
            <input type="checkbox" name="went_to_extra_time" defaultChecked={match.went_to_extra_time} />
            Foi para prorrogação / pênaltis
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-steel">Pênaltis (casa)</label>
              <input
                name="penalty_home_score"
                type="number"
                min={0}
                defaultValue={match.penalty_home_score ?? ""}
                className="stat-num w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-center text-ivory outline-none focus:border-gold-500/60"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-steel">Pênaltis (visitante)</label>
              <input
                name="penalty_away_score"
                type="number"
                min={0}
                defaultValue={match.penalty_away_score ?? ""}
                className="stat-num w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-center text-ivory outline-none focus:border-gold-500/60"
              />
            </div>
          </div>

          <button className="w-full rounded-lg bg-gold-500 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">
            Salvar resultado e finalizar
          </button>
        </form>

        <div className="mt-5 flex justify-center gap-3 border-t border-navy-700/60 pt-5">
          <form action={registrarWO.bind(null, matchId, match.team_home_id)}>
            <button className="rounded-lg border border-loss/30 px-3 py-1.5 text-xs text-loss hover:bg-loss/10">
              W.O. a favor de {match.team_home.name}
            </button>
          </form>
          <form action={registrarWO.bind(null, matchId, match.team_away_id)}>
            <button className="rounded-lg border border-loss/30 px-3 py-1.5 text-xs text-loss hover:bg-loss/10">
              W.O. a favor de {match.team_away.name}
            </button>
          </form>
        </div>
      </Panel>

      <div className="grid gap-5 sm:grid-cols-2">
        <RosterStatsForm
          matchId={matchId}
          teamId={match.team_home_id}
          teamName={match.team_home.name}
          roster={homeRoster}
          statByPlayer={statByPlayer}
        />
        <RosterStatsForm
          matchId={matchId}
          teamId={match.team_away_id}
          teamName={match.team_away.name}
          roster={awayRoster}
          statByPlayer={statByPlayer}
        />
      </div>
    </div>
  );
}

function RosterStatsForm({
  matchId,
  teamId,
  teamName,
  roster,
  statByPlayer,
}: {
  matchId: string;
  teamId: string;
  teamName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roster: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statByPlayer: Map<string, any>;
}) {
  return (
    <Panel className="p-5">
      <p className="mb-3 text-sm font-semibold text-ivory">{teamName}</p>
      {roster.length === 0 && (
        <p className="text-sm text-steel-dim">Nenhum jogador cadastrado para este time.</p>
      )}
      <div className="space-y-3">
        {roster.map((player) => {
          const stat = statByPlayer.get(player.id);
          return (
            <form
              key={player.id}
              action={salvarEstatisticaJogador.bind(null, matchId, teamId, player.id)}
              className="grid grid-cols-[1fr_50px_50px_60px_auto] items-end gap-2 border-t border-navy-700/60 pt-3 first:border-t-0 first:pt-0"
            >
              <span className="truncate text-xs text-ivory">{player.name}</span>
              <div>
                <label className="block text-[10px] text-steel-dim">G</label>
                <input
                  name="goals"
                  type="number"
                  min={0}
                  defaultValue={stat?.goals ?? 0}
                  className="stat-num w-full rounded border border-navy-700 bg-navy-800 px-1.5 py-1 text-center text-xs text-ivory outline-none focus:border-gold-500/60"
                />
              </div>
              <div>
                <label className="block text-[10px] text-steel-dim">A</label>
                <input
                  name="assists"
                  type="number"
                  min={0}
                  defaultValue={stat?.assists ?? 0}
                  className="stat-num w-full rounded border border-navy-700 bg-navy-800 px-1.5 py-1 text-center text-xs text-ivory outline-none focus:border-gold-500/60"
                />
              </div>
              <div>
                <label className="block text-[10px] text-steel-dim">Nota</label>
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  min={0}
                  max={10}
                  defaultValue={stat?.rating ?? ""}
                  className="stat-num w-full rounded border border-navy-700 bg-navy-800 px-1.5 py-1 text-center text-xs text-ivory outline-none focus:border-gold-500/60"
                />
              </div>
              <button className="rounded border border-gold-500/30 px-2 py-1 text-[10px] font-medium text-gold-400 hover:bg-gold-500/10">
                Salvar
              </button>
            </form>
          );
        })}
      </div>
    </Panel>
  );
}
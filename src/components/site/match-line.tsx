import Link from "next/link";
import { TeamCrest } from "./team-crest";
import { StatusBadge } from "@/components/ui/primitives";
import type { MatchWithTeams } from "@/lib/types";

function formatDate(iso: string | null) {
  if (!iso) return "Data a definir";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MatchLine({ match }: { match: MatchWithTeams }) {
  const hasScore = match.home_score !== null && match.away_score !== null;
  const wentToPens = match.penalty_home_score !== null;

  return (
    <Link
      href={`/resultados/${match.id}`}
      className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-gold-500/20 hover:bg-navy-800/60"
    >
      <div className="flex flex-1 items-center justify-end gap-2.5 text-right">
        <span className="text-sm font-medium text-ivory truncate">
          {match.team_home.name}
        </span>
        <TeamCrest name={match.team_home.name} logoUrl={match.team_home.logo_url} size={26} />
      </div>

      <div className="flex flex-col items-center gap-1 px-2">
        {hasScore ? (
          <span className="stat-num font-display text-lg font-semibold text-ivory">
            {match.home_score} – {match.away_score}
            {wentToPens && (
              <span className="ml-1 text-xs text-steel-dim">
                ({match.penalty_home_score}-{match.penalty_away_score} pên.)
              </span>
            )}
          </span>
        ) : (
          <span className="font-display text-sm text-steel-dim">vs</span>
        )}
        <span className="text-[11px] text-steel-dim whitespace-nowrap">
          {match.status === "finalizado"
            ? `Jogo ${match.game_number}`
            : formatDate(match.scheduled_at)}
        </span>
      </div>

      <div className="flex flex-1 items-center gap-2.5">
        <TeamCrest name={match.team_away.name} logoUrl={match.team_away.logo_url} size={26} />
        <span className="text-sm font-medium text-ivory truncate">
          {match.team_away.name}
        </span>
      </div>

      <div className="hidden sm:block">
        <StatusBadge status={match.status} />
      </div>
    </Link>
  );
}

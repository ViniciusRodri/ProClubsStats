import Link from "next/link";
import { TeamCrest } from "./team-crest";
import { FormatBadge } from "@/components/ui/primitives";
import type { Match, Team } from "@/lib/types";

interface SeriesCardProps {
  series: {
    id: string;
    format: string;
    round_label: string | null;
    team_home_wins: number;
    team_away_wins: number;
    winner_team_id: string | null;
    team_home: Team;
    team_away: Team;
  };
  matches?: Match[];
}

export function SeriesCard({ series, matches = [] }: SeriesCardProps) {
  const homeWon = series.winner_team_id === series.team_home.id;
  const awayWon = series.winner_team_id === series.team_away.id;

  return (
    <div className="scoreboard-frame rounded-2xl bg-navy-900/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-steel-dim">
          {series.round_label}
        </span>
        <FormatBadge format={series.format} />
      </div>

      <div className="space-y-2.5">
        <div
          className={`flex items-center justify-between rounded-lg px-3 py-2 ${
            homeWon ? "bg-gold-500/10" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamCrest name={series.team_home.name} logoUrl={series.team_home.logo_url} size={26} />
            <span className={`truncate text-sm ${homeWon ? "font-semibold text-gold-400" : "text-ivory"}`}>
              {series.team_home.name}
            </span>
          </div>
          <span className="stat-num text-base font-semibold text-ivory">
            {series.team_home_wins}
          </span>
        </div>

        <div
          className={`flex items-center justify-between rounded-lg px-3 py-2 ${
            awayWon ? "bg-gold-500/10" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamCrest name={series.team_away.name} logoUrl={series.team_away.logo_url} size={26} />
            <span className={`truncate text-sm ${awayWon ? "font-semibold text-gold-400" : "text-ivory"}`}>
              {series.team_away.name}
            </span>
          </div>
          <span className="stat-num text-base font-semibold text-ivory">
            {series.team_away_wins}
          </span>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-navy-700/60 pt-3">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/resultados/${m.id}`}
              className="stat-num rounded-md border border-navy-700 bg-navy-800 px-2 py-1 text-[11px] text-steel hover:border-gold-500/40 hover:text-gold-400"
              title={`Jogo ${m.game_number}`}
            >
              {m.home_score ?? "-"}-{m.away_score ?? "-"}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

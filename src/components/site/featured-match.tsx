import { TeamCrest } from "./team-crest";
import { StatusBadge, FormatBadge } from "@/components/ui/primitives";
import type { MatchWithTeams } from "@/lib/types";

function formatDate(iso: string | null) {
  if (!iso) return "Horário a definir";
  return new Date(iso).toLocaleString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeaturedMatch({ match }: { match: MatchWithTeams | null }) {
  if (!match) {
    return (
      <div className="scoreboard-frame rounded-2xl bg-navy-900/70 p-10 text-center">
        <p className="font-display text-lg text-steel">
          Nenhuma partida agendada no momento.
        </p>
        <p className="mt-1 text-sm text-steel-dim">
          Volte em breve para acompanhar os confrontos.
        </p>
      </div>
    );
  }

  const hasScore = match.home_score !== null && match.away_score !== null;

  return (
    <div className="scoreboard-frame relative overflow-hidden rounded-2xl bg-navy-900/80">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, var(--gold-500) 0px, var(--gold-500) 1px, transparent 1px, transparent 40px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-6 px-6 py-10 sm:px-12">
        <div className="flex items-center gap-3">
          <StatusBadge status={match.status} />
          <FormatBadge format={match.series.format} />
          {match.series.round_label && (
            <span className="text-xs uppercase tracking-widest text-steel-dim">
              {match.series.round_label}
            </span>
          )}
        </div>

        <div className="flex w-full max-w-xl items-center justify-between gap-4">
          <div className="flex flex-1 flex-col items-center gap-3">
            <TeamCrest name={match.team_home.name} logoUrl={match.team_home.logo_url} size={72} />
            <span className="font-display text-center text-base font-medium text-ivory sm:text-lg">
              {match.team_home.name}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            {hasScore ? (
              <span className="stat-num font-display text-5xl font-bold text-gold-400 sm:text-6xl">
                {match.home_score}-{match.away_score}
              </span>
            ) : (
              <span className="font-display text-3xl font-semibold text-steel">
                VS
              </span>
            )}
            <span className="stat-num text-xs text-steel-dim">
              {match.series.team_home_wins} – {match.series.team_away_wins} na série
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center gap-3">
            <TeamCrest name={match.team_away.name} logoUrl={match.team_away.logo_url} size={72} />
            <span className="font-display text-center text-base font-medium text-ivory sm:text-lg">
              {match.team_away.name}
            </span>
          </div>
        </div>

        <p className="text-sm text-steel-dim">{formatDate(match.scheduled_at)}</p>
      </div>
    </div>
  );
}

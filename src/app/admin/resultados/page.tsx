import Link from "next/link";
import { TeamCrest } from "@/components/site/team-crest";
import { Panel, StatusBadge, FormatBadge } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/server";
import type { MatchWithTeams } from "@/lib/types";

async function getAllMatches(): Promise<MatchWithTeams[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(
      "*, team_home:teams!matches_team_home_id_fkey(*), team_away:teams!matches_team_away_id_fkey(*), series:series(*)"
    )
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as MatchWithTeams[];
}

export default async function AdminResultadosPage() {
  const matches = await getAllMatches();
  const pending = matches.filter((m) => m.status === "agendado" || m.status === "ao_vivo");
  const done = matches.filter((m) => m.status === "finalizado" || m.status === "wo");

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.28em] text-gold-500">CRUD</p>
        <h1 className="font-display text-2xl font-bold text-ivory">Resultados</h1>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ivory">Pendentes</p>
        <Panel className="overflow-hidden">
          <ul className="divide-y divide-navy-700/60">
            {pending.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-steel-dim">
                Nenhuma partida pendente. Gere confrontos na aba Confrontos.
              </li>
            )}
            {pending.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/resultados/${m.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-navy-800/60"
                >
                  <StatusBadge status={m.status} />
                  <FormatBadge format={m.series.format} />
                  <div className="flex flex-1 items-center justify-center gap-2 text-sm">
                    <TeamCrest name={m.team_home.name} logoUrl={m.team_home.logo_url} size={22} />
                    <span className="text-ivory">{m.team_home.name}</span>
                    <span className="text-steel-dim">vs</span>
                    <span className="text-ivory">{m.team_away.name}</span>
                    <TeamCrest name={m.team_away.name} logoUrl={m.team_away.logo_url} size={22} />
                  </div>
                  <span className="text-xs text-steel-dim">
                    {m.series.round_label} · Jogo {m.game_number}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ivory">Finalizadas</p>
        <Panel className="overflow-hidden">
          <ul className="divide-y divide-navy-700/60">
            {done.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-steel-dim">
                Nenhuma partida finalizada ainda.
              </li>
            )}
            {done.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/resultados/${m.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-navy-800/60"
                >
                  <StatusBadge status={m.status} />
                  <div className="flex flex-1 items-center justify-center gap-2 text-sm">
                    <TeamCrest name={m.team_home.name} logoUrl={m.team_home.logo_url} size={22} />
                    <span className="text-ivory">{m.team_home.name}</span>
                    <span className="stat-num font-semibold text-gold-400">
                      {m.home_score}-{m.away_score}
                    </span>
                    <span className="text-ivory">{m.team_away.name}</span>
                    <TeamCrest name={m.team_away.name} logoUrl={m.team_away.logo_url} size={22} />
                  </div>
                  <span className="text-xs text-steel-dim">
                    {m.series.round_label} · Jogo {m.game_number}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

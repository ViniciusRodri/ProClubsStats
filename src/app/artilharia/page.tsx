import { TeamCrest } from "@/components/site/team-crest";
import { Panel, SectionTitle } from "@/components/ui/primitives";
import { getTopScorers, getTopAssists } from "@/lib/data";

export const revalidate = 30;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Leaderboard({ rows, statKey }: { rows: any[]; statKey: "goals" | "assists" }) {
  return (
    <Panel>
      <ul className="divide-y divide-navy-700/60">
        {rows.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-steel-dim">
            Nenhuma estatística registrada ainda.
          </li>
        )}
        {rows.map((p, i) => (
          <li key={p.player_id} className="flex items-center gap-3 px-4 py-3.5">
            <span className="stat-num w-5 text-sm text-steel-dim">{i + 1}</span>
            <TeamCrest name={p.team?.name ?? ""} logoUrl={p.team?.logo_url} size={28} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ivory">{p.name}</p>
              <p className="truncate text-xs text-steel-dim">
                {p.team?.short_name ?? p.team?.name}
              </p>
            </div>
            <span className="stat-num text-xl font-bold text-gold-400">{p[statKey]}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default async function ArtilhariaPage() {
  const [scorers, assists] = await Promise.all([getTopScorers(15), getTopAssists(15)]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 space-y-10">
      <SectionTitle
        eyebrow="Premiação individual"
        title="Artilharia e assistências"
        description="Artilheiro (R$ 25,00) e líder de assistências (R$ 25,00) do campeonato. Empate: prêmio dividido igualmente."
      />
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="mb-3 font-display text-sm uppercase tracking-widest text-steel-dim">
            ⚽ Artilheiros
          </p>
          <Leaderboard rows={scorers} statKey="goals" />
        </div>
        <div>
          <p className="mb-3 font-display text-sm uppercase tracking-widest text-steel-dim">
            🅰️ Assistências
          </p>
          <Leaderboard rows={assists} statKey="assists" />
        </div>
      </div>
    </div>
  );
}

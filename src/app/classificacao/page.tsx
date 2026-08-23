import { TeamCrest } from "@/components/site/team-crest";
import { Panel, SectionTitle } from "@/components/ui/primitives";
import { getGroupStandings } from "@/lib/data";

export const revalidate = 30;

const COLUMNS = [
  { key: "played", label: "J" },
  { key: "wins", label: "V" },
  { key: "draws", label: "E" },
  { key: "losses", label: "D" },
  { key: "goals_for", label: "GP" },
  { key: "goals_against", label: "GC" },
  { key: "goal_diff", label: "SG" },
  { key: "points", label: "Pts" },
] as const;

export default async function ClassificacaoPage() {
  const { groupA, groupB } = await getGroupStandings();

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <SectionTitle
        eyebrow="Fase de grupos"
        title="Classificação"
        description="1º e 2º colocado de cada grupo avançam para as semifinais (MD3). O confronto cruza: 1ºA x 2ºB e 1ºB x 2ºA."
      />

      <div className="space-y-8">
        {[
          { label: "Grupo A", rows: groupA },
          { label: "Grupo B", rows: groupB },
        ].map((group) => (
          <Panel key={group.label} className="overflow-x-auto">
            <div className="border-b border-gold-500/15 px-5 py-3">
              <p className="font-display text-sm font-semibold uppercase tracking-wider text-gold-400">
                {group.label}
              </p>
            </div>
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-steel-dim">
                  <th className="px-5 py-2.5 text-left font-medium">#</th>
                  <th className="px-2 py-2.5 text-left font-medium">Time</th>
                  {COLUMNS.map((c) => (
                    <th key={c.key} className="px-2 py-2.5 text-center font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, i) => (
                  <tr
                    key={row.team_id}
                    className={`border-t border-navy-700/60 ${i < 2 ? "bg-gold-500/5" : ""}`}
                  >
                    <td className="px-5 py-3 text-steel-dim">{i + 1}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        <TeamCrest name={row.name} logoUrl={row.logo_url} size={24} />
                        <span className="font-medium text-ivory">{row.name}</span>
                      </div>
                    </td>
                    {COLUMNS.map((c) => (
                      <td
                        key={c.key}
                        className={`stat-num px-2 py-3 text-center ${
                          c.key === "points" ? "font-semibold text-gold-400" : "text-steel"
                        }`}
                      >
                        {(() => {
                          const v = row[c.key as keyof typeof row] as number;
                          return c.key === "goal_diff" && v > 0 ? `+${v}` : v;
                        })()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        ))}
      </div>
    </div>
  );
}

import { MatchLine } from "@/components/site/match-line";
import { Panel, SectionTitle } from "@/components/ui/primitives";
import { getRecentResults, getUpcomingMatches } from "@/lib/data";

export const revalidate = 30;

export default async function ResultadosPage() {
  const [results, upcoming] = await Promise.all([
    getRecentResults(50),
    getUpcomingMatches(20),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 space-y-12">
      <div>
        <SectionTitle eyebrow="Calendário" title="Próximos jogos" />
        <Panel>
          <div className="divide-y divide-navy-700/60">
            {upcoming.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-steel-dim">
                Nenhum jogo agendado no momento.
              </p>
            )}
            {upcoming.map((m) => (
              <MatchLine key={m.id} match={m} />
            ))}
          </div>
        </Panel>
      </div>

      <div>
        <SectionTitle eyebrow="Histórico" title="Resultados" />
        <Panel>
          <div className="divide-y divide-navy-700/60">
            {results.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-steel-dim">
                Nenhuma partida finalizada até o momento.
              </p>
            )}
            {results.map((m) => (
              <MatchLine key={m.id} match={m} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

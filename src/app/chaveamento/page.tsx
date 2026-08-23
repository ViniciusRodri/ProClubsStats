import { SeriesCard } from "@/components/site/series-card";
import { SectionTitle } from "@/components/ui/primitives";
import { getSeriesByStage, getMatchesForSeries } from "@/lib/data";

export const revalidate = 30;

export default async function ChaveamentoPage() {
  const [semis, finals] = await Promise.all([
    getSeriesByStage("semifinal"),
    getSeriesByStage("final"),
  ]);

  const semisWithMatches = await Promise.all(
    semis.map(async (s) => ({ series: s, matches: await getMatchesForSeries(s.id) }))
  );
  const finalsWithMatches = await Promise.all(
    finals.map(async (s) => ({ series: s, matches: await getMatchesForSeries(s.id) }))
  );

  const empty = semis.length === 0 && finals.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <SectionTitle
        eyebrow="Mata-mata"
        title="Playoffs"
        description="Semifinais em melhor de 3. Grande Final em melhor de 7. Empates nos 90 min vão para prorrogação e pênaltis."
      />

      {empty && (
        <p className="rounded-2xl border border-dashed border-navy-700 px-6 py-10 text-center text-sm text-steel-dim">
          O chaveamento será definido assim que a fase de grupos terminar.
        </p>
      )}

      {semisWithMatches.length > 0 && (
        <div className="mb-10">
          <p className="mb-3 font-display text-sm uppercase tracking-widest text-steel-dim">
            Semifinais
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {semisWithMatches.map(({ series, matches }) => (
              <SeriesCard key={series.id} series={series} matches={matches} />
            ))}
          </div>
        </div>
      )}

      {finalsWithMatches.length > 0 && (
        <div>
          <p className="mb-3 font-display text-sm uppercase tracking-widest text-gold-500">
            Grande Final
          </p>
          <div className="mx-auto max-w-md">
            {finalsWithMatches.map(({ series, matches }) => (
              <SeriesCard key={series.id} series={series} matches={matches} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

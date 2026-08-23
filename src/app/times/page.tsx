import Link from "next/link";
import { TeamCrest } from "@/components/site/team-crest";
import { Panel, SectionTitle } from "@/components/ui/primitives";
import { getTeams } from "@/lib/data";

export const revalidate = 60;

export default async function TimesPage() {
  const teams = await getTeams();

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <SectionTitle eyebrow="Os 8 clubes" title="Times" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teams.map((team) => (
          <Link key={team.id} href={`/times/${team.id}`}>
            <Panel className="flex flex-col items-center gap-3 px-5 py-8 text-center transition-transform hover:-translate-y-0.5 hover:border-gold-500/30">
              <TeamCrest name={team.name} logoUrl={team.logo_url} size={64} />
              <div>
                <p className="font-display text-base font-semibold text-ivory">{team.name}</p>
                {team.group_name && (
                  <p className="mt-0.5 text-xs uppercase tracking-widest text-steel-dim">
                    Grupo {team.group_name}
                  </p>
                )}
              </div>
            </Panel>
          </Link>
        ))}
        {teams.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-steel-dim">
            Nenhum time cadastrado ainda.
          </p>
        )}
      </div>
    </div>
  );
}

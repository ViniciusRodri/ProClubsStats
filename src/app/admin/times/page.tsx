import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";
import { TeamCrest } from "@/components/site/team-crest";
import { Panel } from "@/components/ui/primitives";
import { getTeams } from "@/lib/data";
import { createTeam, deleteTeam } from "@/lib/actions/teams";

export default async function AdminTimesPage({
  searchParams,
}: PageProps<"/admin/times">) {
  const teams = await getTeams();
  const { erro } = await searchParams;

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.28em] text-gold-500">CRUD</p>
        <h1 className="font-display text-2xl font-bold text-ivory">Times</h1>
      </div>

      {erro && (
        <div className="rounded-xl border border-loss/30 bg-loss/10 px-4 py-3 text-sm text-loss">
          {Array.isArray(erro) ? erro[0] : erro}
        </div>
      )}

      <Panel className="p-6">
        <p className="mb-4 text-sm font-semibold text-ivory">Cadastrar novo time</p>
        <form action={createTeam} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-steel">Nome do time</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-ivory outline-none focus:border-gold-500/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-steel">Nome curto (opcional)</label>
            <input
              name="short_name"
              maxLength={4}
              placeholder="Ex: FCB"
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-ivory outline-none focus:border-gold-500/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-steel">Grupo</label>
            <select
              name="group_name"
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-ivory outline-none focus:border-gold-500/60"
            >
              <option value="">A definir (usar sorteio)</option>
              <option value="A">Grupo A</option>
              <option value="B">Grupo B</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-steel">Escudo (imagem)</label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-1.5 text-sm text-steel file:mr-3 file:rounded-md file:border-0 file:bg-gold-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-navy-950"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400">
              Cadastrar time
            </button>
          </div>
        </form>
      </Panel>

      <Panel className="overflow-hidden">
        <ul className="divide-y divide-navy-700/60">
          {teams.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-steel-dim">Nenhum time cadastrado.</li>
          )}
          {teams.map((team) => (
            <li key={team.id} className="flex items-center gap-4 px-5 py-3.5">
              <TeamCrest name={team.name} logoUrl={team.logo_url} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ivory">{team.name}</p>
                <p className="text-xs text-steel-dim">
                  {team.group_name ? `Grupo ${team.group_name}` : "Sem grupo"}
                </p>
              </div>
              <Link
                href={`/admin/times/${team.id}`}
                className="rounded-lg border border-navy-700 p-2 text-steel hover:border-gold-500/40 hover:text-gold-400"
                title="Editar time e jogadores"
              >
                <Pencil size={16} />
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deleteTeam(team.id);
                }}
              >
                <button
                  className="rounded-lg border border-navy-700 p-2 text-steel hover:border-loss/50 hover:text-loss"
                  title="Excluir time"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
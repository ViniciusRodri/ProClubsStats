import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { TeamCrest } from "@/components/site/team-crest";
import { Panel } from "@/components/ui/primitives";
import { getTeam, getTeamPlayers } from "@/lib/data";
import { updateTeam } from "@/lib/actions/teams";
import { createPlayer, deletePlayer, updatePlayer } from "@/lib/actions/players";

export default async function AdminTeamEditPage({
  params,
}: PageProps<"/admin/times/[id]">) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  const players = await getTeamPlayers(id);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <TeamCrest name={team.name} logoUrl={team.logo_url} size={48} />
        <div>
          <p className="font-display text-xs uppercase tracking-[0.28em] text-gold-500">
            Editar time
          </p>
          <h1 className="font-display text-2xl font-bold text-ivory">{team.name}</h1>
        </div>
      </div>

      <Panel className="p-6">
        <p className="mb-4 text-sm font-semibold text-ivory">Dados do time</p>
        <form action={updateTeam.bind(null, team.id)} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-steel">Nome do time</label>
            <input
              name="name"
              defaultValue={team.name}
              required
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-ivory outline-none focus:border-gold-500/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-steel">Nome curto</label>
            <input
              name="short_name"
              defaultValue={team.short_name ?? ""}
              maxLength={4}
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-ivory outline-none focus:border-gold-500/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-steel">Grupo</label>
            <select
              name="group_name"
              defaultValue={team.group_name ?? ""}
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-ivory outline-none focus:border-gold-500/60"
            >
              <option value="">Sem grupo</option>
              <option value="A">Grupo A</option>
              <option value="B">Grupo B</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-steel">Trocar escudo</label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-1.5 text-sm text-steel file:mr-3 file:rounded-md file:border-0 file:bg-gold-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-navy-950"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400">
              Salvar alterações
            </button>
          </div>
        </form>
      </Panel>

      <div>
        <p className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-gold-400">
          Elenco
        </p>

        <Panel className="mb-4 overflow-hidden">
          <ul className="divide-y divide-navy-700/60">
            {players.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-steel-dim">
                Nenhum jogador cadastrado.
              </li>
            )}
            {players.map((p) => (
              <li key={p.player_id} className="px-5 py-4">
                <form
                  action={updatePlayer.bind(null, p.player_id, team.id)}
                  className="grid items-end gap-3 sm:grid-cols-[1fr_120px_90px_90px_auto_auto]"
                >
                  <div>
                    <label className="mb-1 block text-[11px] text-steel-dim">Nome</label>
                    <input
                      name="name"
                      defaultValue={p.name}
                      className="w-full rounded-lg border border-navy-700 bg-navy-800 px-2.5 py-1.5 text-sm text-ivory outline-none focus:border-gold-500/60"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-steel-dim">Posição</label>
                    <input
                      name="position"
                      defaultValue={p.position ?? ""}
                      className="w-full rounded-lg border border-navy-700 bg-navy-800 px-2.5 py-1.5 text-sm text-ivory outline-none focus:border-gold-500/60"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-steel-dim">Camisa</label>
                    <input
                      name="shirt_number"
                      type="number"
                      defaultValue={p.shirt_number ?? ""}
                      className="w-full rounded-lg border border-navy-700 bg-navy-800 px-2.5 py-1.5 text-sm text-ivory outline-none focus:border-gold-500/60"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 pb-2 text-[11px] text-steel-dim">
                    <input type="checkbox" name="is_goalkeeper" defaultChecked={p.is_goalkeeper} />
                    Goleiro
                  </label>
                  <button className="rounded-lg border border-gold-500/30 px-3 py-1.5 text-xs font-medium text-gold-400 hover:bg-gold-500/10">
                    Salvar
                  </button>
                  <button
                    formAction={async () => {
                      "use server";
                      await deletePlayer(p.player_id, team.id);
                    }}
                    className="rounded-lg border border-navy-700 p-1.5 text-steel hover:border-loss/50 hover:text-loss"
                    title="Remover jogador"
                  >
                    <Trash2 size={15} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <p className="mb-3 text-sm font-semibold text-ivory">Adicionar jogador</p>
          <form
            action={createPlayer.bind(null, team.id)}
            className="grid items-end gap-3 sm:grid-cols-[1fr_120px_90px_90px_auto]"
          >
            <div>
              <label className="mb-1 block text-[11px] text-steel-dim">Nome</label>
              <input
                name="name"
                required
                className="w-full rounded-lg border border-navy-700 bg-navy-800 px-2.5 py-1.5 text-sm text-ivory outline-none focus:border-gold-500/60"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-steel-dim">Posição</label>
              <input
                name="position"
                placeholder="Ex: ATA"
                className="w-full rounded-lg border border-navy-700 bg-navy-800 px-2.5 py-1.5 text-sm text-ivory outline-none focus:border-gold-500/60"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-steel-dim">Camisa</label>
              <input
                name="shirt_number"
                type="number"
                className="w-full rounded-lg border border-navy-700 bg-navy-800 px-2.5 py-1.5 text-sm text-ivory outline-none focus:border-gold-500/60"
              />
            </div>
            <label className="flex items-center gap-1.5 pb-2 text-[11px] text-steel-dim">
              <input type="checkbox" name="is_goalkeeper" />
              Goleiro
            </label>
            <button className="rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-semibold text-navy-950 hover:bg-gold-400">
              Adicionar
            </button>
          </form>
        </Panel>
      </div>
    </div>
  );
}

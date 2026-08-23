import Link from "next/link";
import { Shield, Users, Swords, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui/primitives";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: teams }, { count: players }, { count: matches }, { count: pending }] =
    await Promise.all([
      supabase.from("teams").select("*", { count: "exact", head: true }),
      supabase.from("players").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }),
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .in("status", ["agendado", "ao_vivo"]),
    ]);

  const cards = [
    { label: "Times cadastrados", value: teams ?? 0, icon: Shield, href: "/admin/times" },
    { label: "Jogadores", value: players ?? 0, icon: Users, href: "/admin/times" },
    { label: "Partidas no total", value: matches ?? 0, icon: Swords, href: "/admin/confrontos" },
    { label: "Partidas pendentes", value: pending ?? 0, icon: ClipboardList, href: "/admin/resultados" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.28em] text-gold-500">Painel</p>
        <h1 className="font-display text-2xl font-bold text-ivory">Visão geral</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Panel className="flex items-center gap-4 p-5 transition-colors hover:border-gold-500/30">
              <div className="rounded-lg bg-navy-800 p-2.5 text-gold-400">
                <c.icon size={20} />
              </div>
              <div>
                <p className="stat-num text-2xl font-bold text-ivory">{c.value}</p>
                <p className="text-xs text-steel-dim">{c.label}</p>
              </div>
            </Panel>
          </Link>
        ))}
      </div>

      <Panel className="p-6">
        <p className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-gold-400">
          Fluxo recomendado
        </p>
        <ol className="space-y-2 text-sm text-steel">
          <li>1. Cadastre os 8 times e seus jogadores em <Link className="text-gold-400 hover:underline" href="/admin/times">Times</Link>.</li>
          <li>2. Sorteie os grupos e gere os confrontos em <Link className="text-gold-400 hover:underline" href="/admin/confrontos">Confrontos</Link>.</li>
          <li>3. Registre os placares e estatísticas em <Link className="text-gold-400 hover:underline" href="/admin/resultados">Resultados</Link> conforme os jogos acontecem.</li>
          <li>4. Ao fim da fase de grupos, gere as semifinais e depois a Grande Final em Confrontos.</li>
        </ol>
      </Panel>
    </div>
  );
}

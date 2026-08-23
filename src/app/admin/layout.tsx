import Link from "next/link";
import Image from "next/image";
import { logout } from "@/lib/actions/auth";
import { LayoutDashboard, Shield, Users, Swords, ClipboardList, LogOut } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/times", label: "Times", icon: Shield },
  { href: "/admin/confrontos", label: "Confrontos", icon: Swords },
  { href: "/admin/resultados", label: "Resultados", icon: ClipboardList },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen bg-navy-950">
      <div className="mx-auto flex max-w-6xl gap-8 px-5 py-8">
        <aside className="hidden w-56 shrink-0 sm:block">
          <div className="sticky top-8">
            <Link href="/" className="mb-8 flex items-center gap-2.5">
              <Image src="/logo/crest.png" alt="" width={32} height={32} />
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-ivory">
                Admin
              </span>
            </Link>
            <nav className="space-y-1">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-steel hover:bg-navy-800 hover:text-ivory"
                >
                  <l.icon size={16} />
                  {l.label}
                </Link>
              ))}
            </nav>
            <form action={logout} className="mt-6">
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-steel-dim hover:bg-navy-800 hover:text-loss">
                <LogOut size={16} />
                Sair
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <nav className="mb-6 flex gap-4 overflow-x-auto sm:hidden">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="whitespace-nowrap text-sm text-steel">
                {l.label}
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}

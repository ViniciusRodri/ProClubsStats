"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-gold-500/10 mt-16">
      <div className="mx-auto max-w-6xl px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-steel-dim">
        <p>Campeonato Pro Clubs — EA FC 26 · Desde 2024</p>
        <div className="flex items-center gap-5">
          <Link href="/regulamento" className="hover:text-gold-400">
            Regulamento
          </Link>
          <Link href="/admin/login" className="hover:text-gold-400">
            Acesso do administrador
          </Link>
        </div>
      </div>
    </footer>
  );
}

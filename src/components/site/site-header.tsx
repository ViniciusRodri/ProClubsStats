"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/classificacao", label: "Grupos" },
  { href: "/chaveamento", label: "Playoffs" },
  { href: "/resultados", label: "Resultados" },
  { href: "/times", label: "Times" },
  { href: "/artilharia", label: "Artilharia" },
  { href: "/regulamento", label: "Regulamento" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/15 bg-navy-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo/crest.png"
            alt="Campeonato Pro Clubs"
            width={44}
            height={44}
            className="rounded-full"
            priority
          />
          <div className="leading-tight">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-gold-400">
              Campeonato
            </p>
            <p className="font-display text-lg font-semibold uppercase tracking-wide text-ivory -mt-1">
              Pro Clubs
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium tracking-wide rounded-md transition-colors ${
                  active
                    ? "text-gold-400"
                    : "text-steel hover:text-ivory"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="md:hidden text-ivory"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-gold-500/10 px-5 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium text-steel hover:text-gold-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

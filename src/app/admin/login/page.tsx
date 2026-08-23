"use client";

import { useActionState } from "react";
import Image from "next/image";
import { login } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-5">
      <div className="scoreboard-frame w-full max-w-sm rounded-2xl bg-navy-900/80 p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo/crest.png" alt="Campeonato Pro Clubs" width={56} height={56} />
          <p className="font-display mt-3 text-xs uppercase tracking-[0.28em] text-gold-500">
            Painel administrativo
          </p>
          <h1 className="font-display text-lg font-semibold text-ivory">
            Campeonato Pro Clubs
          </h1>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs text-steel">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-ivory outline-none focus:border-gold-500/60"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs text-steel">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-ivory outline-none focus:border-gold-500/60"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg border border-loss/30 bg-loss/10 px-3 py-2 text-xs text-loss">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-gold-500 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

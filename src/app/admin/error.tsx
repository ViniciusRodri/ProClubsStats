"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-loss/10 p-3 text-loss">
        <AlertTriangle size={22} />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-ivory">Algo deu errado</p>
        <p className="mt-1 max-w-md text-sm text-steel-dim">
          {error.message || "Não foi possível concluir essa ação. Tente novamente."}
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="rounded-lg border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10"
      >
        Tentar novamente
      </button>
    </div>
  );
}
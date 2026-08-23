import { ReactNode } from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`scoreboard-frame rounded-2xl bg-navy-900/70 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-display text-xs font-medium uppercase tracking-[0.28em] text-gold-500">
      {children}
    </p>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-display mt-1 text-2xl sm:text-3xl font-semibold text-ivory">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-steel">{description}</p>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  ao_vivo: "bg-live/15 text-live border-live/40",
  agendado: "bg-gold-500/10 text-gold-400 border-gold-500/30",
  finalizado: "bg-win/10 text-win border-win/30",
  wo: "bg-loss/10 text-loss border-loss/30",
};

const STATUS_LABEL: Record<string, string> = {
  ao_vivo: "Ao vivo",
  agendado: "Agendado",
  finalizado: "Finalizado",
  wo: "W.O.",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
        STATUS_STYLES[status] ?? "bg-steel/10 text-steel border-steel/30"
      }`}
    >
      {status === "ao_vivo" && <span className="live-dot" />}
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function FormatBadge({ format }: { format: string }) {
  return (
    <span className="rounded-full border border-gold-500/25 bg-navy-800 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-steel">
      {format}
    </span>
  );
}

// Ordem de exibição do elenco (do gol para o ataque), usada tanto no
// painel do admin quanto na página pública do time.
export const POSITIONS = [
  { value: "GOL", label: "Goleiro" },
  { value: "LAT", label: "Lateral" },
  { value: "ZAG", label: "Zagueiro" },
  { value: "VOL", label: "Volante" },
  { value: "MEI", label: "Meio-campo" },
  { value: "ATA", label: "Atacante" },
] as const;

export type PositionCode = (typeof POSITIONS)[number]["value"];

const RANK_BY_VALUE: Record<string, number> = Object.fromEntries(
  POSITIONS.map((p, i) => [p.value, i])
);

/** Retorna a posição do jogador na ordem GOL, LATERAL, ZAGUEIRO, VOL, MEIO CAMPO, ATACANTES. */
export function positionRank(position: string | null | undefined): number {
  if (!position) return POSITIONS.length;
  const rank = RANK_BY_VALUE[position.trim().toUpperCase()];
  return rank ?? POSITIONS.length;
}

/** Compara dois jogadores pela posição (ordem tática) e, em empate, pelo número da camisa. */
export function comparePlayersByPosition<
  T extends { position?: string | null; shirt_number?: number | null }
>(a: T, b: T): number {
  const rankDiff = positionRank(a.position) - positionRank(b.position);
  if (rankDiff !== 0) return rankDiff;
  return (a.shirt_number ?? 999) - (b.shirt_number ?? 999);
}
import { LIEN } from "@/data/money/lien";
import type { GameState } from "@/state/types";

const remaining = (s: GameState) => LIEN.due - s.time.dayId;
const standingFor = (dayId: number) =>
  LIEN.tiers.find(([by]) => dayId <= by)?.[1] ?? 0;

// The Guild's board. Telegraphs the loss and what paying early is worth.
export function lienNotice(s: GameState): string | null {
  if (s.done.includes("act:pay-lien")) return null;
  const left = remaining(s);
  if (left < 0) return "Fenn's paper has come due. The deed reads his name.";
  const tier = standingFor(s.time.dayId);
  const tail =
    tier === 3
      ? " Settled this season, the Guild remembers it."
      : tier === 2
      ? " Settled by the second season, the Guild notes it."
      : "";
  return `Fenn's paper: ${LIEN.amount.toLocaleString()} gold, due in ${left} day${
    left === 1 ? "" : "s"
  }.${tail}`;
}

export const settleLien = (s: GameState): GameState => ({
  ...s,
  standing: {
    ...s.standing,
    "charter-guild":
      (s.standing["charter-guild"] ?? 0) + standingFor(s.time.dayId),
  },
});

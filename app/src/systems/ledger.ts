import type { GameState } from "@/state/types";
import { PlayerClass } from "@/data/classes";
import { unmet } from "./requirements";
import { notify } from "./notices";
import { grant } from "./classes";
import { add } from "@/lib/flags";

// The Ledger: the one teacher with no master. A 《Phantasm》 class has no oath and no trial — a trigger,
// unique to it and never advertised. Met, the Ledger opens a line for the name, once: take it or leave it,
// and leaving it is final. One Phantasm, ever. A name taken opens its own quests (via: "ledger").

const phantasms = () => PlayerClass.all().filter((c) => c.grade === "phantasm");
const decided = (s: GameState, id: string) =>
  s.done.includes(`class:${id}`) || s.done.includes(`declined:${id}`);

// the line that's open now, waiting for an answer
export const offered = (s: GameState): PlayerClass | undefined =>
  phantasms().find(
    (c) => s.done.includes(`ledger:${c.id}`) && !decided(s, c.id)
  );

// run after every quest pass: the first trigger met opens its line
export function ledger(s: GameState): GameState {
  if (offered(s) || phantasms().some((c) => s.done.includes(`class:${c.id}`)))
    return s; // one line at a time; one name, ever
  const c = phantasms().find(
    (c) =>
      !decided(s, c.id) &&
      !s.done.includes(`ledger:${c.id}`) &&
      !unmet(s, c.manifest)
  );
  if (!c) return s;
  return notify(
    { ...s, done: add(s.done, `ledger:${c.id}`) },
    "《The Ledger》 A line opens, in a hand that isn't yours."
  );
}

// the answer
export const takeName =
  (id: string) =>
  (s: GameState): GameState =>
    notify(
      grant(s, PlayerClass.get(id)),
      `《The Ledger》 ${PlayerClass.get(id).name}`
    );
export const leaveName =
  (id: string) =>
  (s: GameState): GameState => ({
    ...s,
    done: add(s.done, `declined:${id}`),
  });

import type { GameState } from "@/state/types";
import {
  TUTORIALS,
  type Pointer,
  type Step,
  type Tutorial,
} from "@/data/tutorial";
import { add } from "@/lib/flags";

// the first tutorial whose start condition holds and which still has an unfinished step
const pick = (s: GameState, inside?: Tutorial["inside"]) => {
  for (const t of TUTORIALS) {
    if (t.inside !== inside || !t.when(s)) continue;
    const step = t.steps.find((st) => !st.done(s));
    if (!step) continue;
    if (step.when && !step.when(s)) continue; // waiting on its moment — a later tutorial may run meanwhile
    return { tutorial: t, step };
  }
};
export const current = (s: GameState) => pick(s); // the world's
export const currentIn = (
  s: GameState,
  inside: NonNullable<Tutorial["inside"]>
) => pick(s, inside); // a screen's own

// is this pointer usable while the current step is up
export const allowed = (s: GameState, p: Pointer): boolean => {
  const c = current(s);
  return !c || !c.step.allow || c.step.allow(s, p);
};

export const dismiss = (s: GameState, step: Step): GameState => ({
  ...s,
  done: add(s.done, `tut:${step.id}`),
});

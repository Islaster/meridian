import type { GameState } from "../state/types";
import {
  TUTORIALS,
  type Pointer,
  type Step,
  type Tutorial,
} from "../data/tutorial";

// the first tutorial whose start condition holds and which still has an unfinished step
export const current = (
  s: GameState
): { tutorial: Tutorial; step: Step } | undefined => {
  for (const t of TUTORIALS) {
    if (!t.when(s)) continue;
    const step = t.steps.find((st) => !st.done(s));
    if (step) return { tutorial: t, step };
  }
};

export const allowed = (s: GameState, p: Pointer): boolean => {
  const c = current(s);
  return !c || !c.step.allow || c.step.allow(s, p);
};

export const dismiss = (s: GameState, step: Step): GameState => ({
  ...s,
  done: [...s.done, `tut:${step.id}`],
});

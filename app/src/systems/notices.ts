import type { GameState } from "../state/types"; // wherever GameState lives

export const notify = (s: GameState, ...texts: string[]): GameState =>
  texts.length ? { ...s, notices: [...(s.notices ?? []), ...texts] } : s;

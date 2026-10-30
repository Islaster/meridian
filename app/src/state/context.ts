import { createContext, useContext } from "react";
import type { GameState } from "./types";

export interface Game {
  state: GameState;
  changeState: <K extends keyof GameState>(
    prop: K,
    value: GameState[K]
  ) => void;
  commit: () => void; // snapshot the current state as "this morning"
  rollback: () => void; // return to it
}

export const GameContext = createContext<Game | null>(null);

export function useGame(): Game {
  const v = useContext(GameContext);
  if (!v) throw new Error("useGame must be used inside GameProvider");
  return v;
}

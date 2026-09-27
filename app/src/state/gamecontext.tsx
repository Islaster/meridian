import { createContext, useContext, useState, type ReactNode } from "react";
import {
  player,
  time,
  bag,
  location,
  done,
  quests,
  offered,
} from "./newGameState";
import type { GameState } from "./types";
import { Toasts } from "./toasts";

interface GameContext {
  state: GameState;
  changeState: <K extends keyof GameState>(
    prop: K,
    value: GameState[K]
  ) => void;
}

const Ctx = createContext<GameContext | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    player,
    time,
    bag,
    world: location,
    done,
    quests,
    offered,
  });

  function changeState<K extends keyof GameState>(
    prop: K,
    value: GameState[K]
  ) {
    setState((prev) => ({ ...prev, [prop]: value }));
    if (prop === "done") console.log("write done:", value);
  }
  return (
    <Ctx.Provider value={{ state, changeState }}>
      {children}
      <Toasts state={state} />
    </Ctx.Provider>
  );
}

export function useGame(): GameContext {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGame must be used inside GameProvider");
  return v;
}

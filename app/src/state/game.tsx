import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { newGame } from "./newgame";
import type { GameState } from "./types";
import { Toasts } from "@/ui/toasts";
import TrackPrompt from "@/ui/trackprompt";
import Ledger from "@/ui/ledger";

// The one store. Systems are pure — (GameState) => GameState — so the screens' whole
// job is: compute the next state with them, hand it here.
export interface Game {
  state: GameState;
  update: (next: GameState | ((s: GameState) => GameState)) => void;
  commit: () => void; // snapshot the current state as "this morning"
  rollback: () => void; // return to it — death
}

const GameContext = createContext<Game | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useGame(): Game {
  const v = useContext(GameContext);
  if (!v) throw new Error("useGame must be used inside GameProvider");
  return v;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const committed = useRef<GameState | null>(null);
  const [state, setState] = useState<GameState>(newGame);

  const update: Game["update"] = (next) => setState(next);
  // updater form on purpose: a sleep queues state then commits — this sees the queued state
  const commit = () =>
    setState((prev) => {
      committed.current = structuredClone(prev);
      return prev;
    });
  // back to the morning — but what you've been shown stays shown: tutorial progress isn't part of the day
  const rollback = () =>
    setState((now) => {
      if (!committed.current) return now;
      const back = structuredClone(committed.current);
      const learned = now.done.filter(
        (f) => f.startsWith("tut:") && !back.done.includes(f)
      );
      return learned.length
        ? { ...back, done: [...back.done, ...learned] }
        : back;
    });

  return (
    <GameContext.Provider value={{ state, update, commit, rollback }}>
      {children}
      <Toasts state={state} />
      <TrackPrompt />
      <Ledger />
    </GameContext.Provider>
  );
}

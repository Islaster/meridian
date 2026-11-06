import { useRef, useState, type ReactNode } from "react";
import { GameContext, type Game } from "./context";
import { newGameState } from "./newGameState";
import type { GameState } from "./types";
import { Toasts } from "../ui/toasts";
import TrackPrompt from "../ui/trackprompt";

export { useGame } from "./context"; // existing imports keep working

export function GameProvider({ children }: { children: ReactNode }) {
  const committed = useRef<GameState | null>(null);
  const [state, setState] = useState<GameState>(newGameState);

  // updater form on purpose: rest() queues several changeState calls, then commit — this sees them all
  const commit = () =>
    setState((prev) => {
      committed.current = structuredClone(prev);
      return prev;
    });
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
  const changeState: Game["changeState"] = (prop, value) =>
    setState((prev) => ({ ...prev, [prop]: value }));

  return (
    <GameContext.Provider value={{ state, changeState, commit, rollback }}>
      {children}
      <Toasts state={state} />
      <TrackPrompt />
    </GameContext.Provider>
  );
}

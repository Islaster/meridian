import { useEffect, useRef, useState } from "react";
import type { GameState } from "./types";
import { xpToNext } from "../systems/progression";
import LedgerLine from "../components/shared/ledgerline";

const CATS = ["equipment", "consumables", "materials", "questItems"] as const;

export function diffToasts(prev: GameState, next: GameState): string[] {
  const out: string[] = [];
  for (const c of CATS) {
    const before = new Map((prev.bag[c] ?? []).map((i) => [i.name, i.qty]));
    for (const it of next.bag[c] ?? []) {
      const d = it.qty - (before.get(it.name) ?? 0);
      if (d > 0) out.push(`《Acquired》 ${it.name}${d > 1 ? ` ×${d}` : ""}`);
    }
  }
  const gold = next.bag.gold - prev.bag.gold;
  if (gold > 0) out.push(`《Coin》 +${gold}`);
  let xp = next.player.xp - prev.player.xp;
  for (let l = prev.player.level; l < next.player.level; l++) xp += xpToNext(l); // xp spent crossing levels
  if (xp > 0) out.push(`《Growth》 +${xp}`);
  return out;
}

interface Toast {
  id: number;
  text: string;
}

export function Toasts({ state }: { state: GameState }) {
  const prev = useRef(state);
  const nextId = useRef(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    const msgs = diffToasts(prev.current, state);
    prev.current = state;
    for (const text of msgs) {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, text }]);
      window.setTimeout(
        () => setToasts((t) => t.filter((x) => x.id !== id)),
        3200
      );
    }
  }, [state]);
  return (
    <div
      style={{
        position: "fixed",
        left: 24,
        bottom: 28,
        display: "flex",
        flexDirection: "column-reverse",
        gap: 6,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(-6px) } 15% { opacity: 1; transform: none } 85% { opacity: 1 } to { opacity: 0 } }`}</style>
      {toasts.map((t) => (
        <LedgerLine>{t.text}</LedgerLine>
      ))}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import type { GameState } from "@/state/types";
import { xpToNext } from "@/systems/progression";
import LedgerLine from "./ledgerline";
import { RANKS } from "@/data/world/land";
import { Item, type Grade } from "@/data/items";
import { graded } from "./grade";

// A notice: a tag in 《》, a thing (colored by its grade — this is the first anyone sees of it), and the rest.
interface Notice {
  tag?: string;
  name?: string;
  grade?: Grade;
  body: string;
}
const parse = (text: string): Notice => {
  const m = /^《([^》]+)》\s*(.*)$/.exec(text);
  return m ? { tag: m[1], body: m[2] } : { body: text };
};

// what changed between two states that the player should be told about
function diff(prev: GameState, next: GameState): Notice[] {
  const out: Notice[] = [];
  for (const [id, qty] of Object.entries(next.bag.items)) {
    const d = qty - (prev.bag.items[id] ?? 0);
    if (d > 0) {
      const it = Item.get(id);
      out.push({
        tag: "Acquired",
        name: it.name,
        grade: it.grade,
        body: d > 1 ? `×${d}` : "",
      });
    }
  }
  const gold = next.bag.gold - prev.bag.gold;
  if (gold > 0) out.push({ tag: "Coin", body: `+${gold}` });
  if (next.player.rank > prev.player.rank)
    out.push({ tag: "Recorded", body: `Rank ${RANKS[next.player.rank]}` });
  let xp = next.player.xp - prev.player.xp;
  for (let l = prev.player.level; l < next.player.level; l++) xp += xpToNext(l); // xp spent crossing levels
  if (xp > 0) out.push({ tag: "Growth", body: `+${xp}` });
  for (const t of next.notices.slice(prev.notices.length)) out.push(parse(t)); // what the systems said
  return out;
}

const SHOW = 4200; // ms on screen — the animation below is timed to it

export function Toasts({ state }: { state: GameState }) {
  const prev = useRef(state);
  const nextId = useRef(0);
  const [toasts, setToasts] = useState<(Notice & { id: number })[]>([]);
  useEffect(() => {
    const msgs = diff(prev.current, state);
    prev.current = state;
    for (const n of msgs) {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, ...n }]);
      window.setTimeout(
        () => setToasts((t) => t.filter((x) => x.id !== id)),
        SHOW
      );
    }
  }, [state]);
  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateX(24px) } 8% { opacity: 1; transform: none } 80% { opacity: 1 } to { opacity: 0 } }`}</style>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            animation: `toastIn ${SHOW}ms ease both`,
            background: "#000",
            border: "1px solid rgba(233,236,242,0.3)",
            borderLeft: "3px solid rgba(233,236,242,0.75)",
            padding: "10px 16px",
            maxWidth: "min(380px, calc(100vw - 48px))",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}
        >
          <LedgerLine>
            {t.tag && `《${t.tag}》 `}
            {t.name && <span style={graded(t.grade)}>{t.name}</span>}
            {t.body && (t.name ? ` ${t.body}` : t.body)}
          </LedgerLine>
        </div>
      ))}
    </div>
  );
}

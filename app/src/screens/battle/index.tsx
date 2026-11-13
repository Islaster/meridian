import { useEffect, useState } from "react";
import { useGame } from "@/state/game";
import { Item } from "@/data/items";
import { carried, SHELF_OF } from "@/systems/inventory";
import { spoils } from "@/systems/combat";
import {
  open,
  enemyTurn,
  strike,
  applyItem,
  flee,
  retarget,
  alive,
  noExit,
  type Fight,
} from "@/systems/battle";
import type { Outcome } from "@/screens/play/useplay";
import { box, wrap } from "@/ui/styles";
import { FILL, FILL_OFF, POOL, FOCUS, LINE, FONT_PANEL } from "@/ui/theme";

const SEG = 10;
const Bar = ({
  value,
  max,
  thin,
  pool,
}: {
  value: number;
  max: number;
  thin?: boolean;
  pool?: boolean;
}) => (
  <div style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: SEG }, (_, i) => (
      <div
        key={i}
        style={{
          width: 14,
          height: thin ? 3 : 6,
          background:
            i < Math.ceil((value / max) * SEG)
              ? thin
                ? "rgba(233,236,242,0.35)"
                : pool
                ? POOL
                : FILL
              : FILL_OFF,
          transition: "background 350ms ease",
        }}
      />
    ))}
  </div>
);
const btn = {
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: `1px solid ${LINE}`,
  padding: "10px 18px",
  cursor: "pointer",
  letterSpacing: "0.08em",
};

// The fight is a value (systems/battle); this renders it and turns clicks into the next one.
export default function Battle({
  monsters,
  onWin,
  onFlee,
  onDeath,
}: {
  monsters: string[];
  onWin: (o: Outcome) => void;
  onFlee: (o: Outcome) => void;
  onDeath: () => void;
}) {
  const { state } = useGame();
  const [f, setF] = useState<Fight>(() => open(state.player, monsters));
  const [items, setItems] = useState(false);
  const me = f.fighters[0];

  // an enemy's turn lands after a beat; the end after a longer one
  useEffect(() => {
    if (f.phase === "enemy") {
      const id = window.setTimeout(() => setF(enemyTurn(f)), 700);
      return () => window.clearTimeout(id);
    }
    if (f.phase === "over") {
      const seed = `${state.time.dayId}:${state.world.area}:${
        state.world.room ?? ""
      }`;
      const out = (loot: boolean): Outcome => ({
        spoils: spoils(f.fallen, seed, loot),
        hp: me.hp,
        used: f.used,
      });
      const id = window.setTimeout(
        () =>
          f.outcome === "won"
            ? onWin(out(true))
            : f.outcome === "fled"
            ? onFlee(out(false))
            : onDeath(),
        f.outcome === "dead" ? 1200 : 900
      );
      return () => window.clearTimeout(id);
    }
  }, [f]); // eslint-disable-line react-hooks/exhaustive-deps -- every turn is a new value; the beat re-arms on each

  // what landed on a fighter this turn — the box shakes, the number floats off it
  const blow = (i: number) => f.blows.find((b) => b.who === i);
  const struck = (i: number) =>
    blow(i) ? { animation: "shake 320ms ease" } : {};
  // the number that floats off a struck box
  const mark = (i: number) => {
    const b = blow(i);
    return b ? (
      <span
        key={f.turn}
        style={{
          position: "absolute",
          right: 10,
          top: -6,
          fontSize: "1.3em",
          letterSpacing: "0.04em",
          pointerEvents: "none",
          animation: "blow 900ms ease-out forwards",
        }}
      >
        {b.amount < 0 ? `+${-b.amount}` : `−${b.amount}`}
      </span>
    ) : null;
  };

  const supplies = carried(state.bag)
    .filter(
      ({ item, qty }) =>
        SHELF_OF[item.kind] === "supplies" && qty - (f.used[item.id] ?? 0) > 0
    )
    .map(({ item, qty }) => ({ item, left: qty - (f.used[item.id] ?? 0) }));
  const trapped = noExit(f);

  return (
    <div style={{ ...wrap, maxWidth: 760, font: FONT_PANEL, gap: 22 }}>
      <style>{`
        @keyframes shake { 0%,100% { transform: none } 20% { transform: translateX(-5px) } 40% { transform: translateX(4px) } 60% { transform: translateX(-3px) } 80% { transform: translateX(2px) } }
        @keyframes blow { from { opacity: 1; transform: translateY(0) } to { opacity: 0; transform: translateY(-28px) } }
      `}</style>
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {f.fighters.map(
          (x, i) =>
            x.enemy && (
              <div
                key={i}
                onClick={() => setF(retarget(f, i))}
                style={{
                  ...box,
                  position: "relative",
                  opacity: alive(x) ? 1 : 0.3,
                  borderColor: i === f.target && alive(x) ? FOCUS : LINE,
                  cursor: "pointer",
                  ...struck(i),
                }}
              >
                {mark(i)}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span>{x.name}</span>
                  <span style={{ opacity: 0.6 }}>Lv {x.level}</span>
                </div>
                <Bar value={x.hp} max={x.maxHp} />
                <Bar value={x.ready} max={100} thin />
              </div>
            )
        )}
      </div>
      <div
        style={{
          ...box,
          position: "relative",
          alignSelf: "flex-start",
          ...struck(0),
        }}
      >
        {mark(0)}
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span>{me.name}</span>
          <span style={{ opacity: 0.6 }}>Lv {me.level}</span>
        </div>
        <Bar value={me.hp} max={me.maxHp} />
        <span style={{ fontSize: "0.8em", opacity: 0.6 }}>
          {me.hp} / {me.maxHp}
        </span>
        {state.player.maxMp > 0 && (
          <>
            <Bar value={state.player.mp} max={state.player.maxMp} pool />
            <span style={{ fontSize: "0.8em", opacity: 0.6 }}>
              <span style={{ letterSpacing: "0.1em" }}>pool</span>{" "}
              {state.player.mp} / {state.player.maxMp}
            </span>
          </>
        )}
        <div style={{ marginTop: 6 }}>
          <Bar value={me.ready} max={100} thin />
        </div>
      </div>
      <div
        style={{
          minHeight: 120,
          borderTop: "1px solid rgba(233,236,242,0.15)",
          paddingTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          opacity: 0.85,
        }}
      >
        {f.log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      {f.phase === "player" && !items && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={btn} onClick={() => setF(strike(f))}>
            Attack
          </button>
          <button
            style={{ ...btn, opacity: 0.35 }}
            disabled
            title="No path opened"
          >
            Skills
          </button>
          <button
            style={{
              ...btn,
              opacity: f.itemUsed || !supplies.length ? 0.35 : 1,
            }}
            disabled={f.itemUsed || !supplies.length}
            onClick={() => setItems(true)}
          >
            Item
          </button>
          <button
            style={{ ...btn, opacity: trapped ? 0.35 : 1 }}
            disabled={trapped}
            onClick={() => setF(flee(f))}
          >
            {trapped ? "Flee · no way out" : "Flee"}
          </button>
        </div>
      )}
      {f.phase === "player" && items && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {supplies.map(({ item, left }) => (
            <button
              key={item.id}
              style={btn}
              onClick={() => {
                setF(applyItem(f, Item.get(item.id)));
                setItems(false);
              }}
            >
              {item.name} ×{left}
            </button>
          ))}
          <button
            style={{ ...btn, opacity: 0.6 }}
            onClick={() => setItems(false)}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}

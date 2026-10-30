import { useEffect, useState } from "react";
import { useGame } from "../../state/gamecontext";
import { Monster } from "../../data/monsters";
import { Consumable, Throwable } from "../../data/items";
import { itemByName, takeItem } from "../../systems/inventory";
import { levelUp } from "../../systems/progression";
import {
  playerAttack,
  playerDefense,
  hit,
  spoils,
  type Spoils,
} from "../../systems/combat";

import { SERIF } from "../../ui/cards";

interface Fighter {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  agility: number;
  ready: number;
  enemy: boolean;
  id?: string;
  fleeable: boolean;
}
type Phase = "tick" | "player" | "enemy" | "over";

const SEG = 10;
const Bar = ({
  value,
  max,
  dim,
  pool,
}: {
  value: number;
  max: number;
  dim?: boolean;
  pool?: boolean;
}) => (
  <div style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: SEG }, (_, i) => (
      <div
        key={i}
        style={{
          width: 14,
          height: dim ? 3 : 6,
          background:
            i < Math.ceil((value / max) * SEG)
              ? dim
                ? "rgba(233,236,242,0.35)"
                : pool
                ? "rgba(226,196,140,0.85)"
                : "rgba(233,236,242,0.85)"
              : "rgba(233,236,242,0.12)",
        }}
      />
    ))}
  </div>
);
const box = {
  border: "1px solid rgba(233,236,242,0.28)",
  padding: "10px 14px",
  display: "flex",
  flexDirection: "column" as const,
  gap: 6,
  minWidth: 180,
};
const btn = {
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: "1px solid rgba(233,236,242,0.28)",
  padding: "10px 18px",
  cursor: "pointer",
  letterSpacing: "0.08em",
};

export default function Battle({
  monsters,
  onWin,
  onFlee,
  onDeath,
}: {
  monsters: string[];
  onWin: (s: Spoils) => void;
  onFlee: () => void;
  onDeath: () => void;
}) {
  const { state, changeState } = useGame();
  const p = state.player;
  const [f, setF] = useState<Fighter[]>(() => [
    {
      name: p.name,
      level: p.level,
      hp: p.hp,
      maxHp: p.maxHp,
      attack: playerAttack(p),
      defense: playerDefense(p),
      agility: p.stats.agi ?? 5,
      ready: 0,
      enemy: false,
      fleeable: true,
      mp: 0,
      maxMp: 0,
    },
    ...monsters.map((id) => {
      const m = Monster.get(id);
      return {
        id,
        name: m.name,
        level: m.level,
        hp: m.hp,
        maxHp: m.hp,
        attack: m.attack,
        defense: m.defense,
        agility: m.agility,
        ready: 0,
        enemy: true,
        fleeable: m.fleeable,
        mp: 0,
        maxMp: 0,
      };
    }),
  ]);
  const [phase, setPhase] = useState<Phase>("tick");
  const [actor, setActor] = useState(0);
  const [target, setTarget] = useState(1);
  const [log, setLog] = useState<string[]>([]);
  const [itemUsed, setItemUsed] = useState(false);
  const [items, setItems] = useState(false);
  const say = (t: string) => setLog((l) => [...l.slice(-5), t]);
  const alive = (x: Fighter) => x.hp > 0;
  const enemies = f.filter((x) => x.enemy);

  // gauges fill in whole segments until someone is ready; player wins ties
  useEffect(() => {
    if (phase !== "tick") return;
    const next = f.map((x) => ({ ...x }));
    let who = next.findIndex((x) => alive(x) && x.ready >= 100);
    while (who < 0) {
      for (const x of next)
        if (alive(x)) x.ready = Math.min(100, x.ready + x.agility * 2);
      who = next.findIndex((x) => alive(x) && x.ready >= 100);
    }
    setF(next);
    setActor(who);
    if (next[who].enemy) setPhase("enemy");
    else {
      setItemUsed(false);
      if (!alive(next[target]))
        setTarget(next.findIndex((x) => x.enemy && alive(x)));
      setPhase("player");
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // the enemy's turn resolves after a beat
  useEffect(() => {
    if (phase !== "enemy") return;
    const id = window.setTimeout(() => {
      const next = f.map((x) => ({ ...x }));
      const e = next[actor],
        dmg = hit(e.attack, next[0].defense);
      next[0].hp = Math.max(0, next[0].hp - dmg);
      e.ready = 0;
      say(`${e.name} hits you for ${dmg}.`);
      setF(next);
      changeState("player", { ...state.player, hp: next[0].hp });
      if (next[0].hp <= 0) {
        setPhase("over");
        say("The world goes out.");
        window.setTimeout(onDeath, 1200);
      } else setPhase("tick");
    }, 700);
    return () => window.clearTimeout(id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const award = (t: Fighter, player: typeof state.player) => {
    if (!t.id) return player;
    const m = Monster.get(t.id);
    say(`${t.name} falls. +${m.xp} xp.`);
    return levelUp({ ...player, xp: player.xp + m.xp });
  };

  const finish = (next: Fighter[]) => {
    setPhase("over");
    const s = spoils(
      monsters,
      `${state.time.dayId}:${state.world.dungeon}:${state.world.room}`
    );
    say(`Won. ${s.xp} xp.`);
    setF(next);
    window.setTimeout(() => onWin(s), 900);
  };
  const attack = () => {
    const next = f.map((x) => ({ ...x }));
    const t = next[target],
      dmg = hit(next[0].attack, t.defense);
    t.hp = Math.max(0, t.hp - dmg);
    next[0].ready = 0;
    say(`You hit ${t.name} for ${dmg}.`);
    if (t.hp <= 0) changeState("player", award(t, state.player));
    if (!next.some((x) => x.enemy && alive(x))) return finish(next);
    setF(next);
    setPhase("tick");
  };
  const use = (name: string) => {
    const it = itemByName(name);
    const next = f.map((x) => ({ ...x }));
    let player = state.player;
    if (it instanceof Consumable) {
      next[0].hp = Math.min(next[0].maxHp, next[0].hp + it.heal);
      say(`${it.name}: +${it.heal}.`);
    } else if (it instanceof Throwable) {
      const t = next[target];
      t.hp = Math.max(0, t.hp - it.damage);
      say(`${it.name} hits ${t.name} for ${it.damage}.`);
      if (t.hp <= 0) player = award(t, player);
    } else return;
    changeState("bag", takeItem(state.bag, it.id));
    changeState("player", { ...player, hp: next[0].hp });
    setItemUsed(true);
    setItems(false);
    if (!next.some((x) => x.enemy && alive(x))) return finish(next);
    setF(next);
  };
  const flee = () => {
    if (enemies.some((e) => alive(e) && !e.fleeable)) return;
    const fastest = Math.max(...enemies.filter(alive).map((e) => e.agility));
    if (f[0].agility > fastest) {
      say("You run.");
      setPhase("over");
      window.setTimeout(onFlee, 600);
      return;
    }
    const next = f.map((x) => ({ ...x }));
    next[0].ready = 0;
    say("They're faster.");
    setF(next);
    setPhase("tick");
  };

  const noExit = enemies.some((e) => alive(e) && !e.fleeable);
  const consumables = (state.bag.consumables ?? []).filter((c) => c.qty > 0);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "rgba(233,236,242,0.92)",
        font: `400 clamp(14px, 1.4vw, 18px) ${SERIF}`,
        padding: "40px 24px",
        maxWidth: 760,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {f.map(
          (x, i) =>
            x.enemy && (
              <div
                key={i}
                onClick={() => alive(x) && phase === "player" && setTarget(i)}
                style={{
                  ...box,
                  opacity: alive(x) ? 1 : 0.3,
                  borderColor:
                    i === target && alive(x)
                      ? "rgba(200,212,255,0.7)"
                      : "rgba(233,236,242,0.28)",
                  cursor: "pointer",
                }}
              >
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
                <Bar value={x.ready} max={100} dim />
              </div>
            )
        )}
      </div>
      <div style={{ ...box, alignSelf: "flex-start" }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span>{f[0].name}</span>
          <span style={{ opacity: 0.6 }}>Lv {f[0].level}</span>
        </div>
        <Bar value={f[0].hp} max={f[0].maxHp} />
        <span style={{ fontSize: "0.8em", opacity: 0.6 }}>
          {f[0].hp} / {f[0].maxHp}
        </span>
        {f[0].maxMp > 0 && (
          <>
            <Bar value={f[0].mp} max={f[0].maxMp} pool />
            <span style={{ fontSize: "0.8em", opacity: 0.6 }}>
              <span style={{ letterSpacing: "0.1em" }}>ki</span> {f[0].mp} /{" "}
              {f[0].maxMp}
            </span>
          </>
        )}
        <div style={{ marginTop: 6 }}>
          <Bar value={f[0].ready} max={100} dim />
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
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      {phase === "player" && !items && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={btn} onClick={attack}>
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
              opacity: itemUsed || !consumables.length ? 0.35 : 1,
            }}
            disabled={itemUsed || !consumables.length}
            onClick={() => setItems(true)}
          >
            Item
          </button>
          <button
            style={{ ...btn, opacity: noExit ? 0.35 : 1 }}
            disabled={noExit}
            onClick={flee}
          >
            {noExit ? "Flee · no way out" : "Flee"}
          </button>
        </div>
      )}
      {phase === "player" && items && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {consumables.map((c) => (
            <button key={c.name} style={btn} onClick={() => use(c.name)}>
              {c.name} ×{c.qty}
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

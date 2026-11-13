import { Monster } from "@/data/monsters";
import { Consumable, Throwable, Item } from "@/data/items";
import type { Player } from "@/state/types";
import { playerAttack, playerDefense, hit } from "./combat";

// A fight, as a value. The screen holds one and renders it; every turn is a function
// from one Fight to the next, so the rules live here and nothing in the screen decides.
export interface Fighter {
  id?: string; // a monster id; the player has none
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  agility: number;
  ready: number; // the gauge, 0–100
  enemy: boolean;
  fleeable: boolean;
}
export type Phase = "player" | "enemy" | "over";
export interface Fight {
  fighters: Fighter[]; // the player first
  actor: number;
  target: number;
  phase: Phase;
  log: string[];
  itemUsed: boolean; // one item per turn
  used: Record<string, number>; // consumables spent, by id — taken from the bag when it's over
  fallen: string[]; // monster ids killed, for the spoils
  outcome?: "won" | "fled" | "dead";
}

const READY = 100;
export const alive = (x: Fighter) => x.hp > 0;
const say = (f: Fight, line: string): Fight => ({
  ...f,
  log: [...f.log.slice(-5), line],
});
const you = (f: Fight) => f.fighters[0];
const foes = (f: Fight) => f.fighters.filter((x) => x.enemy && alive(x));
const patch = (f: Fight, i: number, p: Partial<Fighter>): Fight => ({
  ...f,
  fighters: f.fighters.map((x, k) => (k === i ? { ...x, ...p } : x)),
});
const fall = (f: Fight, i: number): Fight => {
  const t = f.fighters[i];
  return t.id && !alive(t) ? { ...f, fallen: [...f.fallen, t.id] } : f;
};
// the fight ends when no foe stands
const settle = (f: Fight): Fight =>
  foes(f).length
    ? tick(f)
    : { ...say(f, "Won."), phase: "over", outcome: "won" };

export function open(p: Player, monsters: string[]): Fight {
  const me: Fighter = {
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
  };
  const them = monsters.map((id) => {
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
    };
  });
  return tick({
    fighters: [me, ...them],
    actor: 0,
    target: 1,
    phase: "player",
    log: [],
    itemUsed: false,
    used: {},
    fallen: [],
  });
}

// the clock: gauges fill in whole segments until someone is ready (the player wins ties).
// Every turn ends by running it, so a fight is always waiting on someone.
function tick(f: Fight): Fight {
  const next = f.fighters.map((x) => ({ ...x }));
  let who = next.findIndex((x) => alive(x) && x.ready >= READY);
  while (who < 0) {
    for (const x of next)
      if (alive(x)) x.ready = Math.min(READY, x.ready + x.agility * 2);
    who = next.findIndex((x) => alive(x) && x.ready >= READY);
  }
  const out = { ...f, fighters: next, actor: who };
  if (next[who].enemy) return { ...out, phase: "enemy" };
  const target = alive(next[f.target])
    ? f.target
    : next.findIndex((x) => x.enemy && alive(x));
  return { ...out, target, phase: "player", itemUsed: false };
}

export function enemyTurn(f: Fight): Fight {
  const e = f.fighters[f.actor],
    dmg = hit(e.attack, you(f).defense);
  let out = patch(f, 0, { hp: Math.max(0, you(f).hp - dmg) });
  out = patch(out, f.actor, { ready: 0 });
  out = say(out, `${e.name} hits you for ${dmg}.`);
  return you(out).hp <= 0
    ? { ...say(out, "The world goes out."), phase: "over", outcome: "dead" }
    : tick(out);
}

export function strike(f: Fight): Fight {
  const t = f.fighters[f.target],
    dmg = hit(you(f).attack, t.defense);
  let out = patch(f, f.target, { hp: Math.max(0, t.hp - dmg) });
  out = patch(out, 0, { ready: 0 });
  out = say(out, `You hit ${t.name} for ${dmg}.`);
  out = fall(out, f.target);
  return settle(out);
}

// a potion or a flask; the turn goes on, but only one item a turn
export function applyItem(f: Fight, item: Item): Fight {
  let out: Fight = {
    ...f,
    used: { ...f.used, [item.id]: (f.used[item.id] ?? 0) + 1 },
    itemUsed: true,
  };
  if (item instanceof Consumable) {
    out = patch(out, 0, { hp: Math.min(you(f).maxHp, you(f).hp + item.heal) });
    out = say(out, `${item.name}: +${item.heal}.`);
    return out;
  }
  if (item instanceof Throwable) {
    const t = f.fighters[f.target];
    out = patch(out, f.target, { hp: Math.max(0, t.hp - item.damage) });
    out = say(out, `${item.name} hits ${t.name} for ${item.damage}.`);
    out = fall(out, f.target);
    return foes(out).length ? out : settle(out);
  }
  return f;
}

export const noExit = (f: Fight) => foes(f).some((e) => !e.fleeable);
// you run if you're faster than everything still standing; otherwise the turn is spent
export function flee(f: Fight): Fight {
  if (noExit(f)) return f;
  const fastest = Math.max(...foes(f).map((e) => e.agility));
  if (you(f).agility > fastest)
    return { ...say(f, "You run."), phase: "over", outcome: "fled" };
  return tick(say(patch(f, 0, { ready: 0 }), "They're faster."));
}

export const retarget = (f: Fight, i: number): Fight =>
  f.phase === "player" && alive(f.fighters[i]) ? { ...f, target: i } : f;

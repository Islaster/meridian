import type { GameState } from "@/state/types";
import type { Action } from "@/models/location";
import type { Requirement } from "@/models/quest";
import { GRADES, type Grade } from "@/models/item";
import { PlayerClass } from "@/data/classes";
import { PRACTICE_PROF, PRACTICE_CAP } from "./time";
import { add, drop, under } from "@/lib/flags";

// Two roads to an oath, never both: a common class opens at its own level,
// a rarer one when its master says you've proved it (their trial sets `proved:<npc>`). The class knows its road.
const gate = (c: PlayerClass): Requirement =>
  c.road === "level" ? { level: c.level } : { proved: c.master };

// the lowest level any oath opens at — when the hall first has something to say
export const firstOath = () =>
  Math.min(
    ...PlayerClass.all()
      .filter((c) => c.road === "level")
      .map((c) => c.level ?? Infinity)
  );

// every class written on the Ledger — `class:<id>` flags; the first is the name shown, the rest are held under it
export const held = (s: GameState): PlayerClass[] =>
  under(s.done, "class:")
    .map((f) => PlayerClass.registry.get(f.slice(6)))
    .filter((c): c is PlayerClass => !!c);

// what a class gives when it's written in: its starter skills, a pool if it has one, its line on the Ledger.
// A Phantasm name stays on top; anything sworn after it is held under it.
export const grant = (s: GameState, c: PlayerClass, pool = 10): GameState => {
  const skills = { ...s.player.skills };
  for (const id of c.starts) skills[id] ??= 1;
  const top =
    !!s.player.class && PlayerClass.get(s.player.class).grade === "phantasm";
  return {
    ...s,
    player: {
      ...s.player,
      class: top ? s.player.class : c.id,
      skills,
      maxMp: c.pool ? Math.max(s.player.maxMp, pool) : s.player.maxMp,
      mp: c.pool ? Math.max(s.player.mp, pool) : s.player.mp,
    },
    done: add(s.done, `class:${c.id}`),
  };
};

// the oath: the class's road must be walked (level or trial) and no oath standing with another master
const induct =
  (classId: string, pool = 10) =>
  (s: GameState): GameState => {
    const c = PlayerClass.get(classId);
    const ready =
      c.road === "level"
        ? s.player.level >= (c.level ?? 0)
        : s.done.includes(`proved:${c.master}`);
    const elsewhere = under(s.done, "sworn:").some(
      (f) => f !== `sworn:${c.master}`
    );
    if (!ready || elsewhere) return s;
    const sworn = grant(
      { ...s, done: s.done.filter((f) => !/^act:(leave|walk-out)-/.test(f)) },
      c,
      pool
    );
    return {
      ...sworn,
      done: add(
        sworn.done,
        "inducted",
        `sworn:${c.master}`,
        `master:${c.master}`
      ),
    };
  };

// a lesson lands if any class you hold teaches it
export const learn =
  (...ids: string[]) =>
  (s: GameState): GameState => {
    const mine = held(s);
    const id = ids.find(
      (i) =>
        mine.some((c) => c.skills.includes(i)) &&
        s.player.skills[i] === undefined
    );
    if (!id) return s;
    return {
      ...s,
      player: { ...s.player, skills: { ...s.player.skills, [id]: 1 } },
    };
  };

export const leave =
  (npc: string, how: "left" | "betrayed") =>
  (s: GameState): GameState => ({
    ...s,
    done: add(
      drop(s.done, `sworn:${npc}`, ...under(s.done, "act:oath-")),
      `${how}:${npc}`
    ),
  });

// one oath per class the master teaches, lesser first, and the two ways out
const SUFFIX: Partial<Record<Grade, string>> = {
  inferiority: "-lesser",
  normal: "",
};
const WORDS: Partial<Record<Grade, string>> = {
  inferiority:
    "No ring, no test. The words are shorter and so is what they open — but it opens.",
  normal:
    "You say the words. Two fingers against your sternum, and something under them that has been shut your whole life opens. It was always there. Now it's yours.",
};
export const oaths = (npc: string, short: string): Action[] => {
  const rank = (c: PlayerClass) => GRADES.indexOf(c.grade);
  const mine = PlayerClass.all()
    .filter((c) => c.master === npc)
    .sort((a, b) => rank(a) - rank(b));
  const out: Action[] = mine.map((c) => {
    const asks =
      (c.road === "level" ? ` · level ${c.level}` : "") +
      Object.entries(c.floor)
        .map(([k, n]) => ` · ${k.toUpperCase()} ${n}`)
        .join(""); // what the pointer says it wants; the grey reason says what's missing
    const closes = mine
      .filter((o) => rank(o) >= rank(c))
      .map((o) => `class:${o.id}`); // holding this one, or a better one of theirs, closes it
    return {
      id: `oath-${npc}${SUFFIX[c.grade] ?? `-${c.grade}`}`,
      oath: npc,
      label: `Take ${short}'s oath · ${c.name}${asks}`,
      text:
        WORDS[c.grade] ??
        "Longer words than the hall teaches, and older. What they open was never shut; it was waiting for someone to say them right.",
      requires: {
        ...gate(c),
        stats: c.floor,
        not: [`betrayed:${npc}`, ...closes],
      },
      effect: induct(c.id),
    };
  });
  out.push(
    {
      id: `leave-${npc}`,
      label: `Ask ${short}'s leave`,
      hours: 1,
      text: "They hear you out, and nod once. The door stays where it is.",
      requires: { flags: [`sworn:${npc}`] },
      effect: leave(npc, "left"),
    },
    {
      id: `walk-out-${npc}`,
      label: `Walk out on ${short}`,
      text: "You don't say anything. Neither do they. The gate is louder than either of you.",
      requires: { flags: [`sworn:${npc}`] },
      effect: leave(npc, "betrayed"),
    }
  );
  return out;
};

// a session in a master's room: proficiency in their medium, two sessions a day that count
export const practice =
  (npc: string) =>
  (s: GameState): GameState => {
    const cls = PlayerClass.find(
      (c) => c.master === npc && c.grade === "normal"
    );
    const medium = cls?.medium ?? cls?.crafts[0];
    const today = `practice:day:${s.time.dayId}`,
      n = (s.counters[today] ?? 0) + 1;
    const proficiency = { ...s.player.proficiency };
    if (n <= PRACTICE_CAP && medium)
      proficiency[medium] = (proficiency[medium] ?? 0) + PRACTICE_PROF;
    return {
      ...s,
      player: { ...s.player, proficiency },
      counters: { ...s.counters, [today]: n },
    };
  };

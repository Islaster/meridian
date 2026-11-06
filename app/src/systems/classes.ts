import type { GameState } from "../state/types";
import type { Action } from "../models/location";
import { PlayerClass } from "../data/classes";
import { PRACTICE_PROF, PRACTICE_CAP } from "./time";
import { Skill } from "../data/skills";

// the oath: class, pool and starter skills come from the class; the master's trial must be passed and no oath standing
export const induct =
  (classId: string, pool = 10) =>
  (s: GameState): GameState => {
    const c = PlayerClass.get(classId);
    const proved =
      c.grade === "inferiority" || s.done.includes(`proved:${c.master}`);
    if (
      !proved ||
      s.done.some((f) => f.startsWith("sworn:") && f !== `sworn:${c.master}`)
    )
      return s;
    const skills = { ...s.player.skills };
    for (const id of c.starts) skills[id] ??= 1;
    return {
      ...s,
      player: {
        ...s.player,
        class: classId,
        skills,
        maxMp: c.pool ? Math.max(s.player.maxMp, pool) : s.player.maxMp,
        mp: c.pool ? Math.max(s.player.mp, pool) : s.player.mp,
      },
      done: [
        ...new Set([
          ...s.done.filter((f) => !/^act:(leave|walk-out)-/.test(f)),
          "inducted",
          `sworn:${c.master}`,
          `master:${c.master}`,
          `class:${c.id}`,
        ]),
      ],
    };
  };

export const learn =
  (...ids: string[]) =>
  (s: GameState): GameState => {
    const c = s.player.class ? PlayerClass.get(s.player.class) : null;
    const id = ids.find(
      (i) => c?.skills.includes(i) && s.player.skills[i] === undefined
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
    done: [
      ...s.done.filter(
        (f) => f !== `sworn:${npc}` && !f.startsWith("act:oath-")
      ),
      `${how}:${npc}`,
    ],
  });

// the oath, the lesser oath, and the two ways out — read off the classes that name this master
export const oaths = (npc: string, short: string): Action[] => {
  const mine = [...PlayerClass.registry.values()].filter(
    (c) => c.master === npc
  );
  const normal = mine.find((c) => c.grade === "normal");
  const lesser = mine.find((c) => c.grade === "inferiority");
  const not = [`sworn:${npc}`, `betrayed:${npc}`];
  const out: Action[] = [];
  if (normal)
    out.push({
      id: `oath-${npc}`,
      oath: npc,
      label:
        `Take ${short}'s oath · ${normal.name}` +
        Object.entries(normal.floor)
          .map(([k, n]) => ` · ${k.toUpperCase()} ${n}`)
          .join(""),
      text: "You say the words. Two fingers against your sternum, and something under them that has been shut your whole life opens. It was always there. Now it's yours.",
      requires: {
        flags: [`proved:${npc}`],
        stats: normal.floor,
        not: [`betrayed:${npc}`, `class:${normal.id}`],
      },
      effect: induct(normal.id),
    });
  if (lesser)
    out.push({
      id: `oath-${npc}-lesser`,
      oath: npc,
      label: `Take ${short}'s oath · ${lesser.name} · no floor, no trial`,
      text: "No ring, no test. The words are shorter and so is what they open — but it opens.",
      requires: {
        flags: [`errands:${npc}`],
        not: [
          `betrayed:${npc}`,
          `class:${lesser.id}`,
          ...(normal ? [`class:${normal.id}`] : []),
        ],
      },
      effect: induct(lesser.id),
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
      requires: { flags: [`errands:${npc}`], not },
      effect: leave(npc, "betrayed"),
    }
  );
  return out;
};

export const practice =
  (npc: string, sessions: number) =>
  (s: GameState): GameState => {
    const cls = [...PlayerClass.registry.values()].find(
      (c) => c.master === npc && c.grade === "normal"
    );
    const medium = cls?.medium ?? cls?.crafts[0] ?? "";
    const key = `practice:${npc}`,
      n = (s.counters[key] ?? 0) + 1;
    const today = `practice:day:${s.time.dayId}`,
      todayN = (s.counters[today] ?? 0) + 1;
    const counts = todayN <= PRACTICE_CAP;
    const noticed = n >= sessions && !s.done.includes(`noticed:${npc}`);

    const proficiency = { ...s.player.proficiency };
    const uses = { ...s.player.uses };
    if (counts && medium) {
      proficiency[medium] = (proficiency[medium] ?? 0) + PRACTICE_PROF; // the tool
      for (const id of Object.keys(s.player.skills))
        if (Skill.get(id).weapon === medium) uses[id] = (uses[id] ?? 0) + 1; // the technique
    }
    return {
      ...s,
      player: { ...s.player, proficiency, uses },
      counters: { ...s.counters, [key]: n, [today]: todayN },
      done: noticed ? [...s.done, `noticed:${npc}`, "noticed"] : s.done,
    };
  };

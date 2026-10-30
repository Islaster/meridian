import type { GameState } from "../state/types";

export type Pointer =
  | { kind: "exit"; id: string }
  | { kind: "npc"; id: string }
  | { kind: "action"; id: string }
  | { kind: "board" }
  | { kind: "shop" }
  | { kind: "wait" }
  | { kind: "rest" }
  | { kind: "menu" };

export interface Step {
  id: string;
  text: string;
  target?: string; // what to spotlight — a selector on data-tut
  done: (s: GameState) => boolean;
  allow?: (s: GameState, p: Pointer) => boolean; // absent = everything
}

export interface Tutorial {
  id: string;
  title: string;
  when: (s: GameState) => boolean;
  steps: Step[];
}

const at = (key: string) => `[data-tut="${key}"]`;

const YARDS = [
  "sword-yard",
  "the-butts",
  "the-forge",
  "the-stillroom",
  "lantern-house",
  "kiln-yard",
];
const has = (s: GameState, f: string) => s.done.includes(f);
const menu = (p: Pointer) => p.kind === "menu"; // the journal stays reachable in every step
const idle = (p: Pointer) => p.kind === "wait" || p.kind === "rest";

// ── Getting a master: requirement → meet → prove → offer → class quests ─────
const MASTER: Step[] = [
  {
    id: "pick",
    text: "Six masters still teach in Caldermouth, each in their own place. Pick one and go where they teach — the ✦ marks the ways.",
    done: (s) => YARDS.includes(s.world.area),
    allow: (_, p) => p.kind === "exit" || idle(p) || menu(p),
  },
  {
    id: "practice",
    text: "Nobody teaches a stranger. Practice here — a session takes four hours — until they look up. Rest if the day runs out.",
    done: (s) => has(s, "noticed"),
    allow: (_, p) =>
      (p.kind === "action" && p.id.startsWith("practice-")) ||
      idle(p) ||
      menu(p),
  },
  {
    id: "meet",
    text: "They've looked up. Talk to them and hear the terms.",
    done: (s) => has(s, "met"),
    allow: (_, p) => p.kind === "npc" || menu(p),
  },
  {
    id: "prove",
    text: "They'll ask for something, then something else. Do both — the journal tracks it, the ✦ leads. A trial and a stat floor buy the trained class instead; that road is open too.",
    done: (s) => has(s, "errands") || has(s, "proved"),
  },
  {
    id: "oath",
    text: "Terms named. Take the oath — the short words open the common class now; the long ones wait on the trial.",
    done: (s) => has(s, "inducted"),
    allow: (_, p) =>
      (p.kind === "action" && p.id.startsWith("oath-")) ||
      p.kind === "exit" ||
      idle(p) ||
      menu(p),
  },
  {
    id: "class",
    text: "A name for what you are. Your master's quests are in the journal now — each one opens something the oath didn't.",
    done: (s) => has(s, "tut:class"), // ends when dismissed
  },
];

export const TUTORIALS: Tutorial[] = [
  {
    id: "opening",
    title: "The first morning",
    when: () => true,
    steps: [
      {
        id: "tracker",
        target: at("tracker"),
        done: (s) => has(s, "tut:tracker"),
        text: "This is the quest you're following. The ✦ on the ways out marks which one leads there.",
        allow: (_, p) => menu(p),
      },
      {
        id: "exits",
        target: at("exits"),
        done: (s) => has(s, "tut:exits"),
        text: "Every way out costs time — it's written on the door. Clocks and shops don't wait.",
        allow: (_, p) => menu(p),
      },
      {
        id: "menu",
        target: at("menu"),
        done: (s) => has(s, "tut:menu"),
        text: "The menu holds your bag, your sheet, your skills, and the journal. Everything you've been told is in there.",
        allow: (_, p) => menu(p),
      },
    ],
  },
  {
    id: "equip",
    title: "Something to wield",
    when: (s) => (s.bag.equipment ?? []).length > 0,
    steps: [
      {
        id: "equip",
        text: "You're carrying something you could wield. Open the menu, go to Inventory, and press Equip beside it. Nothing you carry does anything until it's in your hands.",
        done: (s) => !!s.player.equipment?.mainWeapon,
        allow: (_, p) => menu(p),
      },
    ],
  },
  {
    id: "master",
    title: "A master's word",
    when: (s) => s.quests["a-masters-word"]?.status === "taken",
    steps: MASTER,
  },
];

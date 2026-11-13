import type { GameState } from "@/state/types";
import { firstOath } from "@/systems/classes";
import { carried } from "@/systems/inventory";
import { isGear } from "@/models/item";

export type Pointer =
  | { kind: "exit"; id: string }
  | { kind: "npc"; id: string }
  | { kind: "action"; id: string }
  | { kind: "board" }
  | { kind: "shop" }
  | { kind: "wait" }
  | { kind: "rest" }
  | { kind: "menu" };
export type MenuTab = "inventory" | "character" | "skills" | "journal";

export interface Step {
  id: string;
  text: string;
  target?: string; // what to spotlight — a selector on data-tut
  tab?: MenuTab; // a menu walkthrough step: the menu shows this tab while the step is up
  when?: (s: GameState) => boolean; // its moment — until then nothing shows and nothing is gated
  done: (s: GameState) => boolean;
  allow?: (s: GameState, p: Pointer) => boolean; // absent = everything
}

// a tutorial can belong to a screen
export interface Tutorial {
  id: string;
  title: string;
  when: (s: GameState) => boolean;
  steps: Step[];
  inside?: "menu"; // run by that screen while it's open, not by the world
}

const at = (key: string) => `[data-tut="${key}"]`;

const has = (s: GameState, f: string) => s.done.includes(f);
const menu = (p: Pointer) => p.kind === "menu"; // the journal stays reachable in every step

// the hall's masters: one explainer, once, when the first oath opens
const MASTER: Step[] = [
  {
    id: "oath",
    text: `Level ${firstOath()}: the first of the hall's oaths opens. The six who keep it each teach a short name and a full one, and every name opens at its own level — the pointer in their room says which, and the full one asks a stat floor besides. Find them in their rooms off the floor; they move with the hour, and some afternoons they're in town. The ✦ leads.`,
    done: (s) => has(s, "inducted") || has(s, "tut:oath"),
  },
  {
    id: "class",
    when: (s) => has(s, "inducted"),
    text: "A name for what you are. Your master's quests are in the journal now — each one opens something the oath didn't. Rarer masters are out in the world, and they're earned the long way.",
    done: (s) => has(s, "tut:class"),
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
        text: "The quest you're following. One at a time, and always here under the scene: its name, and what it wants next.",
        allow: (_, p) => menu(p),
      },
      {
        id: "mark",
        target: at("mark"),
        done: (s) => has(s, "tut:mark"),
        text: "Its mark. Everything that leads toward this quest carries the same one.",
        allow: (_, p) => menu(p),
      },
      {
        id: "key",
        target: at("key"),
        done: (s) => has(s, "tut:key"),
        text: "The marks, by kind: ✦ the main story, ◇ side work, ⚔ a bounty, ⚑ a mission. This key stays in the footer.",
        allow: (_, p) => menu(p),
      },
      {
        id: "way",
        target: at("way"),
        done: (s) => has(s, "tut:way"),
        text: "The way out that leads toward what you're following carries its mark. Take the marked ways and you arrive.",
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
        id: "world",
        done: (s) => has(s, "tut:world"),
        text: "Nothing here waits on the mark. The world is open: walk anywhere a door leads, and every road out of town goes somewhere. A ? beside a name means that person has work for you — solid, they'll offer it when you talk; hollow, they already did and it's waiting in your journal. Places keep hours, roads have their nights, boards turn, and some things are only there on the day you look.",
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
    id: "menu",
    title: "The ledger",
    inside: "menu", // shows the first time the menu is open, and picks up where it left off until it's done
    when: () => true,
    steps: [
      {
        id: "shelves",
        tab: "inventory",
        target: at("shelves"),
        done: (s) => has(s, "tut:shelves"),
        text: "Your bag, by shelf: gear, supplies, materials, Quest Items. Each shelf sorts its own way, and a piece of gear opens its card when you click its name.",
      },
      {
        id: "sheet",
        tab: "character",
        target: at("stats"),
        done: (s) => has(s, "tut:sheet"),
        text: "Your sheet. A level brings points, and they're spent here — the heading says when some are waiting. Your best stat is what a bad night takes from.",
      },
      {
        id: "skills",
        tab: "skills",
        target: at("skills"),
        done: (s) => has(s, "tut:skills"),
        text: "What you can do in a fight. Empty until a master gives you a name: skills come from a class, and a class comes from a master.",
      },
      {
        id: "journal",
        tab: "journal",
        target: at("journal"),
        done: (s) => has(s, "tut:journal"),
        text: "Everything you've been told. Active is what you're on; Offered is work you left for later, with Accept beside it; Done is the record. [ track ] beside any quest follows that one — and when you take on something new while following another, the same button appears for a moment on the scene.",
      },
      {
        id: "close",
        target: at("close"),
        done: (s) => has(s, "tut:close"),
        text: "Close, or Esc. Nothing moves while this is open — the clock waits for you.",
      },
    ],
  },
  {
    id: "home",
    title: "A roof",
    when: (s) => s.world.area === "hall",
    steps: [
      {
        id: "rest",
        target: at("rest"),
        text: "Your bed. Sleep here before midnight and the day ends clean — mended, and the morning you come back to if you die. Caught out at midnight, you sleep where you stand and wake weary: your best stat down until a proper night.",
        done: (s) => has(s, "tut:rest"),
        allow: (_, p) => p.kind === "rest" || menu(p),
      },
    ],
  },
  {
    id: "equip",
    title: "Something to wield",
    when: (s) => carried(s.bag).some(({ item }) => isGear(item)),
    steps: [
      {
        id: "equip",
        text: "You're carrying something you could wield. Open the menu, go to Inventory, and press Equip beside it. Nothing you carry does anything until it's in your hands.",
        done: (s) => !!s.player.equipment.weapon,
        allow: (_, p) => menu(p),
      },
    ],
  },
  {
    id: "master",
    title: "A master's word",
    when: (s) => s.player.level >= firstOath() && !!s.quests["a-masters-word"],
    steps: MASTER,
  },
];

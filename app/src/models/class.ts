import type { Craft, Grade, WeaponType } from "./item";
import type { Requirement } from "./quest";
import { Registry, Entity } from "@/lib/registry";

export type Lineage = "battle" | "support";
export type Element = "tide" | "ember" | "dream"; // a spell's medium, as a weapon type is a technique's

// How a class opens — one road each, never two.
//   level    · the common grades: a hall master teaches it, and the oath opens at the class's own level
//   proof    · the rarer grades: a master out in the world, and their trial (`proved:<npc>`) is the whole gate
//   manifest · a Phantasm: no master, no oath — its own trigger, met, and the Ledger writes the name
export type Road = "level" | "proof" | "manifest";
const COMMON: readonly Grade[] = ["inferiority", "normal"];

interface ClassOpts {
  lineage: Lineage;
  pool?: "ki" | "mana";
  medium?: WeaponType | Element;
  crafts?: Craft[];
  describe?: string;
  master?: string; // the NPC who inducts it (every road but manifest)
  level?: number; // the level the oath opens at (the level road only) — a stronger kit opens later, grade or no grade
  skills?: string[]; // curriculum — what holding this class lets you learn
  starts?: string[]; // granted at induction
  floor?: Record<string, number>; // stat floor for the oath — "str: 7"
  manifest?: Requirement; // a Phantasm's trigger (the manifest road only)
}

export class PlayerClass extends Entity {
  static registry = new Registry<PlayerClass>("class");
  id: string;
  name: string;
  grade: Grade;
  road: Road;
  lineage: Lineage;
  pool?: "ki" | "mana";
  medium?: WeaponType | Element;
  crafts: Craft[];
  describe: string;
  master: string;
  level?: number;
  skills: string[];
  starts: string[];
  floor: Record<string, number>;
  manifest?: Requirement;
  constructor(id: string, name: string, grade: Grade, opts: ClassOpts) {
    super();
    this.id = id;
    this.name = name;
    this.grade = grade;
    this.road =
      grade === "phantasm"
        ? "manifest"
        : COMMON.includes(grade)
        ? "level"
        : "proof";
    this.lineage = opts.lineage;
    this.pool = opts.pool;
    this.medium = opts.medium;
    this.crafts = opts.crafts ?? [];
    this.describe = opts.describe ?? "";
    this.master = opts.master ?? "";
    this.level = opts.level;
    this.skills = opts.skills ?? [];
    this.starts = opts.starts ?? [];
    this.floor = opts.floor ?? {};
    this.manifest = opts.manifest;
    // the road decides what the class must name and what it can't
    const has = {
      level: this.level !== undefined,
      master: !!this.master,
      manifest: !!this.manifest,
    };
    const wants = {
      level: this.road === "level",
      master: this.road !== "manifest",
      manifest: this.road === "manifest",
    };
    for (const k of ["level", "master", "manifest"] as const)
      if (has[k] !== wants[k])
        throw new Error(
          `${id}: a ${grade} class opens by ${this.road}, so it ${
            wants[k] ? "needs a" : "can't have a"
          } ${k}`
        );
    PlayerClass.registry.add(this);
  }
}

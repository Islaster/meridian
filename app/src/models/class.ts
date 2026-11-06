import type { Craft, Grade, WeaponType } from "./item";
import { register } from "./registry";

export type Lineage = "battle" | "support";
export type Element = "tide" | "ember"; // a spell's medium, as a weapon type is a technique's

interface ClassOpts {
  lineage: Lineage;
  pool?: "ki" | "mana";
  medium?: WeaponType | Element;
  crafts?: Craft[];
  describe?: string;
  master?: string; // the NPC who inducts it
  skills?: string[]; // curriculum — what holding this class lets you learn
  starts?: string[]; // granted at induction
  floor?: Record<string, number>; // stat floor for the oath — "str: 7"
}

export class PlayerClass {
  static registry = new Map<string, PlayerClass>();
  static get(id: string): PlayerClass {
    const c = PlayerClass.registry.get(id);
    if (!c) throw new Error(`unknown class: ${id}`);
    return c;
  }
  id: string;
  name: string;
  grade: Grade;
  lineage: Lineage;
  pool?: "ki" | "mana";
  medium?: WeaponType | Element;
  crafts: Craft[];
  describe: string;
  master: string;
  skills: string[];
  starts: string[];
  floor: Record<string, number>;
  constructor(id: string, name: string, grade: Grade, opts: ClassOpts) {
    this.id = id;
    this.name = name;
    this.grade = grade;
    this.lineage = opts.lineage;
    this.pool = opts.pool;
    this.medium = opts.medium;
    this.crafts = opts.crafts ?? [];
    this.describe = opts.describe ?? "";
    this.master = opts.master ?? "";
    this.skills = opts.skills ?? [];
    this.starts = opts.starts ?? [];
    this.floor = opts.floor ?? {};
    register(PlayerClass.registry, "class ", id, this);
  }
}

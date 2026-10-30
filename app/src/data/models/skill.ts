import type { WeaponType } from "./item";
import { type Element } from "./class";

interface SkillOpts {
  cost: number;
  power?: number;
  heal?: number;
  describe: string;
  family?: string;
}

export class Skill {
  static registry = new Map<string, Skill>();
  static get(id: string): Skill {
    const s = Skill.registry.get(id);
    if (!s) throw new Error(`unknown skill: ${id}`);
    return s;
  }
  id: string;
  name: string;
  weapon: WeaponType | Element | "any";
  cost: number; // ki
  power: number; // × weapon damage; 0 = not an attack
  heal: number;
  describe: string;
  family?: string;
  constructor(
    id: string,
    name: string,
    weapon: WeaponType | Element | "any",
    opts: SkillOpts
  ) {
    this.id = id;
    this.name = name;
    this.weapon = weapon;
    this.cost = opts.cost;
    this.power = opts.power ?? 0;
    this.heal = opts.heal ?? 0;
    this.describe = opts.describe;
    this.family = opts.family;
    Skill.registry.set(id, this);
  }
}

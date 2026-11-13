import type { WeaponType } from "./item";
import type { Element } from "./class";
import { Registry, Entity } from "@/lib/registry";

interface SkillOpts {
  cost: number;
  power?: number;
  heal?: number;
  describe: string;
  family?: string;
}

export class Skill extends Entity {
  static registry = new Registry<Skill>("skill");
  id: string;
  name: string;
  weapon: WeaponType | Element | "any"; // the medium it's practiced through
  cost: number; // from the class pool — ki or mana
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
    super();
    this.id = id;
    this.name = name;
    this.weapon = weapon;
    this.cost = opts.cost;
    this.power = opts.power ?? 0;
    this.heal = opts.heal ?? 0;
    this.describe = opts.describe;
    this.family = opts.family;
    Skill.registry.add(this);
  }
}

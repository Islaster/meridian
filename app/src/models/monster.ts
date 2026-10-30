export type Archetype = "near" | "far" | "swarmer" | "heavy";
export interface Drop {
  item: string;
  chance: number;
} // 0..1

export class Monster {
  static registry = new Map<string, Monster>();
  static get(id: string): Monster {
    const m = Monster.registry.get(id);
    if (!m) throw new Error(`unknown monster: ${id}`);
    return m;
  }

  id: string;
  name: string;
  level: number;
  archetype: Archetype;
  hp: number;
  attack: number;
  defense: number;
  agility: number;
  xp: number;
  gold: [number, number];
  drops: Drop[];
  describe: string;
  fleeable: boolean;

  constructor(
    id: string,
    name: string,
    level: number,
    archetype: Archetype,
    stats: { hp: number; attack: number; defense: number; agility: number },
    loot: { xp: number; gold?: [number, number]; drops?: Drop[] },
    describe: string,
    fleeable = true
  ) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.archetype = archetype;
    this.hp = stats.hp;
    this.attack = stats.attack;
    this.defense = stats.defense;
    this.agility = stats.agility;
    this.xp = loot.xp;
    this.gold = loot.gold ?? [0, 0];
    this.drops = loot.drops ?? [];
    this.describe = describe;
    this.fleeable = fleeable;
    Monster.registry.set(id, this);
  }
}

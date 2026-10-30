export const GRADES = [
  "inferiority",
  "normal",
  "rare",
  "unique",
  "ancient",
  "legendary",
  "phantasm",
] as const;
export const WEAPON_TYPES = [
  "sword",
  "axe",
  "bow",
  "staff",
  "club",
  "knife",
] as const;
const SLOT_OF: Partial<Record<Subgroup, Slot>> = {
  helmet: "head",
  headband: "head",
  jerkin: "armor",
  robe: "armor",
  cloak: "back",
  gloves: "hands",
  boots: "boots",
  shield: "offhand",
  ring: "ring",
  sword: "weapon",
  axe: "weapon",
  bow: "weapon",
  staff: "weapon",
  club: "weapon",
};

export type Grade = (typeof GRADES)[number];
export type Kind =
  | "weapon"
  | "armor"
  | "consumable"
  | "throwable"
  | "material"
  | "quest";
export type WeaponType = (typeof WEAPON_TYPES)[number];
export type ArmorGroup =
  | "helmet"
  | "headband"
  | "jerkin"
  | "robe"
  | "cloak"
  | "gloves"
  | "boots"
  | "shield"
  | "clothes"
  | "ring";
export type SupplyGroup = "potion" | "food" | "oil" | "bomb";
export type MaterialGroup =
  | "hide"
  | "shell"
  | "ore"
  | "plant"
  | "part"
  | "fuel";
export type Subgroup = WeaponType | ArmorGroup | SupplyGroup | MaterialGroup;
export type Tag = Kind | Subgroup;
export type Craft = "smith" | "tailor" | "fletch" | "alchemy" | "cook";
export type Slot =
  | "head"
  | "armor"
  | "hands"
  | "boots"
  | "back"
  | "ring"
  | "offhand"
  | "weapon";

export interface Recipe {
  craft: Craft;
  materials: { id: string; qty: number }[];
  basic?: boolean;
}
interface GearOpts {
  reqLevel?: number;
  reqStats?: Record<string, number>;
  price?: number;
  grade?: Grade;
}

export class Item {
  static registry = new Map<string, Item>();
  static get(id: string): Item {
    const it = Item.registry.get(id);
    if (!it) throw new Error(`unknown item: ${id}`);
    return it;
  }

  id: string;
  name: string;
  tags: Tag[];
  grade: Grade;
  price: number;
  recipe?: Recipe;
  constructor(
    id: string,
    name: string,
    tags: Tag[],
    grade: Grade = "normal",
    price = 0
  ) {
    this.id = id;
    this.name = name;
    this.tags = tags;
    this.grade = grade;
    this.price = price;
    Item.registry.set(id, this);
  }
  has(tag: Tag): boolean {
    return this.tags.includes(tag);
  }
  get kind(): Kind {
    return this.tags[0] as Kind;
  } // first tag is the kind, by convention
  get slot(): Slot | undefined {
    for (const t of this.tags) {
      const s = SLOT_OF[t as Subgroup];
      if (s) return s;
    }
  }

  made(craft: Craft, materials: Recipe["materials"], basic = false) {
    this.recipe = { craft, materials, basic };
    return this;
  }
}

export class Weapon extends Item {
  damage: number;
  reqLevel: number;
  reqStats: Record<string, number>;
  scaling?: { stat: string; per: number; from: number };
  constructor(
    id: string,
    name: string,
    type: WeaponType,
    damage: number,
    opts: GearOpts & { scaling?: Weapon["scaling"] } = {}
  ) {
    super(id, name, ["weapon", type], opts.grade, opts.price);
    this.damage = damage;
    this.reqLevel = opts.reqLevel ?? 1;
    this.reqStats = opts.reqStats ?? {};
    this.scaling = opts.scaling;
  }
  get weaponType(): WeaponType {
    return this.tags[1] as WeaponType;
  }
}

export class Armor extends Item {
  defense: number;
  reqLevel: number;
  reqStats: Record<string, number>;
  constructor(
    id: string,
    name: string,
    group: ArmorGroup,
    defense: number,
    opts: GearOpts = {}
  ) {
    super(id, name, ["armor", group], opts.grade, opts.price);
    this.defense = defense;
    this.reqLevel = opts.reqLevel ?? 1;
    this.reqStats = opts.reqStats ?? {};
  }
}

export class Consumable extends Item {
  heal: number;
  constructor(
    id: string,
    name: string,
    group: "potion" | "food",
    heal: number,
    price = 0,
    grade: Grade = "normal"
  ) {
    super(id, name, ["consumable", group], grade, price);
    this.heal = heal;
  }
}

export class Throwable extends Item {
  damage: number;
  constructor(
    id: string,
    name: string,
    group: "oil" | "bomb",
    damage: number,
    price = 0,
    grade: Grade = "normal"
  ) {
    super(id, name, ["throwable", group], grade, price);
    this.damage = damage;
  }
}

export class Material extends Item {
  constructor(
    id: string,
    name: string,
    group: MaterialGroup,
    price = 0,
    grade: Grade = "normal"
  ) {
    super(id, name, ["material", group], grade, price);
  }
}

export class QuestItem extends Item {
  constructor(id: string, name: string) {
    super(id, name, ["quest"]);
  }
}

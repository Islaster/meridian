import { Registry, Entity } from "@/lib/registry";

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

export type Grade = (typeof GRADES)[number];
export type WeaponType = (typeof WEAPON_TYPES)[number];
export type Kind =
  | "weapon"
  | "armor"
  | "consumable"
  | "throwable"
  | "material"
  | "tool"
  | "quest";
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
  | "metal"
  | "plant"
  | "part"
  | "fuel";
export type Subgroup = WeaponType | ArmorGroup | SupplyGroup | MaterialGroup;
export type Tag = Kind | Subgroup;
export type Craft = "smith" | "tailor" | "fletch" | "alchemy" | "cook";
// where a piece is worn; the player's equipment record is keyed by these, plus "ring2"
export type Slot =
  | "head"
  | "armor"
  | "hands"
  | "boots"
  | "back"
  | "ring"
  | "offhand"
  | "weapon";

const SLOT_OF: Partial<Record<Subgroup, Slot>> = {
  helmet: "head",
  headband: "head",
  jerkin: "armor",
  robe: "armor",
  clothes: "armor",
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
  knife: "weapon",
};

// A perk is a mechanic: something the engine applies in play and can spell out in words.
export type Perk = { kind: "scaling"; stat: string; per: number; from: number }; // damage grows with a stat

export interface Recipe {
  craft: Craft;
  materials: { id: string; qty: number }[];
  basic?: boolean; // anyone can make it; otherwise the craft's own class
}
interface GearOpts {
  reqLevel?: number;
  reqStats?: Record<string, number>;
  price?: number;
  grade?: Grade;
  describe?: string; // what it looks like — flavor only, never a rule
  perks?: Perk[];
}

export class Item extends Entity {
  static registry = new Registry<Item>("item");
  id: string;
  name: string;
  tags: Tag[]; // the first tag is the kind, the second the group
  grade: Grade;
  price: number;
  describe?: string;
  recipe?: Recipe;
  constructor(
    id: string,
    name: string,
    tags: Tag[],
    grade: Grade = "normal",
    price = 0
  ) {
    super();
    this.id = id;
    this.name = name;
    this.tags = tags;
    this.grade = grade;
    this.price = price;
    Item.registry.add(this);
  }
  get kind(): Kind {
    return this.tags[0] as Kind;
  }
  get group(): Subgroup | undefined {
    return this.tags[1] as Subgroup | undefined;
  }
  get slot(): Slot | undefined {
    return this.group ? SLOT_OF[this.group] : undefined;
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
  perks: Perk[];
  constructor(
    id: string,
    name: string,
    type: WeaponType,
    damage: number,
    opts: GearOpts = {}
  ) {
    super(id, name, ["weapon", type], opts.grade, opts.price);
    this.damage = damage;
    this.reqLevel = opts.reqLevel ?? 1;
    this.reqStats = opts.reqStats ?? {};
    this.perks = opts.perks ?? [];
    this.describe = opts.describe;
  }
  get weaponType(): WeaponType {
    return this.tags[1] as WeaponType;
  }
}

export class Armor extends Item {
  defense: number;
  reqLevel: number;
  reqStats: Record<string, number>;
  perks: Perk[];
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
    this.perks = opts.perks ?? [];
    this.describe = opts.describe;
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

export class Tool extends Item {
  constructor(id: string, name: string, price = 0, describe?: string) {
    super(id, name, ["tool"], "normal", price);
    this.describe = describe;
  }
}

export class QuestItem extends Item {
  constructor(id: string, name: string) {
    super(id, name, ["quest"]);
  }
}

// gear is anything worn: the two classes with a slot, stats and perks
export type Gear = Weapon | Armor;
export const isGear = (it: Item | undefined): it is Gear =>
  it instanceof Weapon || it instanceof Armor;

export type ItemKind = "weapon" | "armor" | "consumable" | "material" | "quest";
export type WeaponType = "sword" | "axe" | "bow" | "staff" | "club";
export type ArmorSlot = "head" | "armor" | "boots" | "ring" | "back" | "hands";
export type Grade =
  | "inferiority"
  | "normal"
  | "rare"
  | "unique"
  | "ancient"
  | "legendary"
  | "phantasm";

export class Item {
  static registry = new Map<string, Item>();
  static get(id: string): Item {
    const it = Item.registry.get(id);
    if (!it) throw new Error(`unknown item: ${id}`);
    return it;
  }

  id: string;
  name: string;
  kind: ItemKind;
  grade: Grade;
  price: number;

  constructor(
    id: string,
    name: string,
    kind: ItemKind,
    grade: Grade = "normal",
    price = 0
  ) {
    this.id = id;
    this.name = name;
    this.kind = kind;
    this.grade = grade;
    this.price = price;
    Item.registry.set(id, this);
  }
}

export class Consumable extends Item {
  heal: number;
  constructor(
    id: string,
    name: string,
    heal: number,
    price = 0,
    grade: Grade = "normal"
  ) {
    super(id, name, "consumable", grade, price);
    this.heal = heal;
  }
}

export class Weapon extends Item {
  weaponType: WeaponType;
  damage: number;
  reqLevel: number;
  reqStats: Record<string, number>;
  constructor(
    id: string,
    name: string,
    weaponType: WeaponType,
    damage: number,
    opts: {
      reqLevel?: number;
      reqStats?: Record<string, number>;
      price?: number;
      grade?: Grade;
    } = {}
  ) {
    super(id, name, "weapon", opts.grade ?? "normal", opts.price ?? 0);
    this.weaponType = weaponType;
    this.damage = damage;
    this.reqLevel = opts.reqLevel ?? 1;
    this.reqStats = opts.reqStats ?? {};
  }
}

export class Armor extends Item {
  slot: ArmorSlot;
  defense: number;
  reqLevel: number;
  reqStats: Record<string, number>;
  constructor(
    id: string,
    name: string,
    slot: ArmorSlot,
    defense: number,
    opts: {
      reqLevel?: number;
      reqStats?: Record<string, number>;
      price?: number;
      grade?: Grade;
    } = {}
  ) {
    super(id, name, "armor", opts.grade ?? "normal", opts.price ?? 0);
    this.slot = slot;
    this.defense = defense;
    this.reqLevel = opts.reqLevel ?? 1;
    this.reqStats = opts.reqStats ?? {};
  }
}

export class Material extends Item {
  constructor(id: string, name: string, price = 0, grade: Grade = "normal") {
    super(id, name, "material", grade, price);
  }
}

export class QuestItem extends Item {
  constructor(id: string, name: string) {
    super(id, name, "quest", "normal", 0);
  }
}

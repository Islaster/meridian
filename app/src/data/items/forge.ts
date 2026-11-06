import {
  Weapon,
  Armor,
  Material,
  Item,
  GRADES,
  type MaterialGroup,
  type Grade,
  type WeaponType,
  type ArmorGroup,
  type Craft,
} from "../../models/item";
import { METALS, type Row } from "../../models/metal";

type Stock = "metal" | "wood" | "hide";
type Part = [Stock | string, number]; // a row's stock, or a fixed material id

const WEAPONS: Record<
  string,
  { type: WeaponType; dmg: number; price: number; of: Stock; parts: Part[] }
> = {
  longsword: {
    type: "sword",
    dmg: 9,
    price: 140,
    of: "metal",
    parts: [
      ["metal", 2],
      ["hide", 1],
      ["charcoal", 1],
    ],
  }, // blade, grip
  axe: {
    type: "axe",
    dmg: 10,
    price: 130,
    of: "metal",
    parts: [
      ["metal", 1],
      ["wood", 1],
      ["charcoal", 1],
    ],
  }, // head, haft
  dirk: {
    type: "knife",
    dmg: 6,
    price: 90,
    of: "metal",
    parts: [
      ["metal", 1],
      ["hide", 1],
      ["charcoal", 1],
    ],
  },
  bow: {
    type: "bow",
    dmg: 8,
    price: 120,
    of: "wood",
    parts: [
      ["wood", 2],
      ["kelp-fiber", 1],
      ["pine-resin", 1],
    ],
  }, // stave, string, glue
  staff: {
    type: "staff",
    dmg: 7,
    price: 100,
    of: "wood",
    parts: [
      ["wood", 2],
      ["metal", 1],
    ],
  }, // shaft, shod end
};
const ARMOR: Record<
  string,
  { group: ArmorGroup; def: number; price: number; of: Stock; parts: Part[] }
> = {
  cap: {
    group: "helmet",
    def: 2,
    price: 40,
    of: "metal",
    parts: [
      ["metal", 1],
      ["hide", 1],
      ["charcoal", 1],
    ],
  }, // shell, lining
  coat: {
    group: "jerkin",
    def: 5,
    price: 110,
    of: "hide",
    parts: [
      ["hide", 2],
      ["kelp-fiber", 1],
    ],
  }, // hide, thread
  boots: {
    group: "boots",
    def: 2,
    price: 45,
    of: "hide",
    parts: [
      ["hide", 1],
      ["kelp-fiber", 1],
    ],
  },
  shield: {
    group: "shield",
    def: 3,
    price: 70,
    of: "metal",
    parts: [
      ["metal", 1],
      ["wood", 1],
      ["charcoal", 1],
    ],
  }, // rim, board
  ring: {
    group: "ring",
    def: 1,
    price: 60,
    of: "metal",
    parts: [
      ["metal", 1],
      ["charcoal", 1],
    ],
  },
};

const STOCKS: string[] = ["metal", "wood", "hide"];
const needs = (t: Row, parts: Part[]) =>
  parts.map(([p, qty]) => ({
    id: STOCKS.includes(p) ? slug(t[p as Stock]) : Item.get(p).id,
    qty,
  }));

// sheet rows
export const GRADE_MULT: Record<Grade, number> = {
  inferiority: 0.8,
  normal: 1,
  rare: 1.2,
  unique: 1.45,
  ancient: 1.75,
  legendary: 2.1,
  phantasm: 2.6,
};
const CRAFT_OF: Record<"metal" | "wood" | "hide", Craft> = {
  metal: "smith",
  wood: "fletch",
  hide: "tailor",
};
const STOCK_GROUP = { metal: "ore", wood: "plant", hide: "hide" } as const;
const OPEN_TIERS = 2;

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const slug = (s: string) => s.replace(/\s+/g, "-");
const ensure = (id: string, group: MaterialGroup, price: number) => {
  if (!Item.registry.has(id))
    new Material(id, id.replace(/-/g, " "), group, price);
};
export const variantId = (base: string, grade: Grade) =>
  grade === "normal" ? base : `${base}-${grade}`;

for (let tier = 0; tier < METALS.length; tier++) {
  const t = METALS[tier];
  const row: Row = t;

  // mined rows get an ore; alloys are made from the row below, found metals are found
  const stock = slug(t.metal),
    ore = `${stock}-ore`;
  if (!row.found && !row.from && !Item.registry.has(ore))
    new Material(ore, `${cap(t.metal)} ore`, "ore", Math.round(8 * t.price));
  if (!Item.registry.has(stock))
    new Material(stock, cap(t.metal), "ore", Math.round(20 * t.price));
  if (!row.found) {
    const inputs = (row.from ?? [[ore, 2]]).map(([id, qty]) => ({ id, qty }));
    for (const m of inputs)
      ensure(m.id, m.id === "charcoal" ? "fuel" : "ore", row.price);
    Item.get(stock).made(
      "smith",
      [...inputs, { id: "charcoal", qty: 1 }],
      METALS.indexOf(t) < OPEN_TIERS
    );
  }
  for (const of of ["wood", "hide"] as const) {
    const id = slug(t[of]);
    if (!Item.registry.has(id))
      new Material(id, cap(t[of]), STOCK_GROUP[of], Math.round(20 * t.price));
  }

  for (const [kind, w] of Object.entries(WEAPONS)) {
    const mat = t[w.of],
      base = `${slug(mat)}-${kind}`;
    for (const grade of GRADES) {
      const m = GRADE_MULT[grade];
      new Weapon(
        variantId(base, grade),
        grade === "normal"
          ? `${cap(mat)} ${kind}`
          : `${cap(mat)} ${kind} 《${cap(grade)}》`,
        w.type,
        Math.round(w.dmg * t.power * m),
        { reqLevel: t.level, price: Math.round(w.price * t.price * m), grade }
      ).made(CRAFT_OF[w.of], needs(t, w.parts));
    }
  }
  for (const [kind, a] of Object.entries(ARMOR)) {
    const mat = t[a.of],
      base = `${slug(mat)}-${kind}`;
    for (const grade of GRADES) {
      const m = GRADE_MULT[grade];
      new Armor(
        variantId(base, grade),
        grade === "normal"
          ? `${cap(mat)} ${kind}`
          : `${cap(mat)} ${kind} 《${cap(grade)}》`,
        a.group,
        Math.round(a.def * t.power * m),
        { reqLevel: t.level, price: Math.round(a.price * t.price * m), grade }
      ).made(CRAFT_OF[a.of], needs(t, a.parts));
    }
  }
}

// the window's shelf for a tier — the normal pieces, ids unchanged
export const shelf = (tier: number) =>
  [...Object.keys(WEAPONS), ...Object.keys(ARMOR)].map((kind) => {
    const of = kind in WEAPONS ? WEAPONS[kind].of : ARMOR[kind].of;
    return `${slug(METALS[tier][of])}-${kind}`;
  });

if (import.meta.hot) import.meta.hot.accept();

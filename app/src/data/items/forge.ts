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
} from "@/models/item";
import { METALS, type Row } from "./metals";

// Standard gear is generated, not written: every row of the metal ladder makes the same
// set of pieces, each in every grade. The two tables below and the ladder are the only data.

type Stock = "metal" | "wood" | "hide"; // a row's three materials, by role
type Part = [Stock | string, number]; // a role from the row, or a fixed item id

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

// sheet rows
const GRADE_MULT: Record<Grade, number> = {
  inferiority: 0.8,
  normal: 1,
  rare: 1.2,
  unique: 1.45,
  ancient: 1.75,
  legendary: 2.1,
  phantasm: 2.6,
};
const CRAFT_OF: Record<Stock, Craft> = {
  metal: "smith",
  wood: "fletch",
  hide: "tailor",
};
const GROUP_OF: Record<Stock, MaterialGroup> = {
  metal: "ore",
  wood: "plant",
  hide: "hide",
};
const OPEN_TIERS = 2; // the first ingots anyone can pour; the rest take a smith

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const slug = (s: string) => s.replace(/\s+/g, "-");
export const variantId = (base: string, grade: Grade) =>
  grade === "normal" ? base : `${base}-${grade}`;
const pieceName = (mat: string, kind: string, grade: Grade) =>
  grade === "normal"
    ? `${cap(mat)} ${kind}`
    : `${cap(mat)} ${kind} 《${cap(grade)}》`;
// a material declared by hand (materials.ts) keeps its own name and price
const declare = (
  id: string,
  label: string,
  group: MaterialGroup,
  price: number
) => {
  if (!Item.registry.has(id)) new Material(id, label, group, price);
};
// a part list against the row: "metal" → this tier's metal, "charcoal" → charcoal
const needs = (row: Row, parts: Part[]) =>
  parts.map(([p, qty]) => ({
    id: p in CRAFT_OF ? slug(row[p as Stock]) : Item.get(p).id,
    qty,
  }));

// ── a row's materials: the ore (if mined), the ingot and how it's poured, the wood and the hide ──
function materials(row: Row, tier: number) {
  const stock = slug(row.metal),
    ore = `${stock}-ore`;
  if (!row.found && !row.from)
    declare(ore, `${cap(row.metal)} ore`, "ore", Math.round(8 * row.price)); // mined
  declare(stock, cap(row.metal), "ore", Math.round(20 * row.price));
  if (!row.found) {
    const inputs = (row.from ?? [[ore, 2]]).map(([id, qty]) => ({ id, qty })); // an alloy names its own inputs
    for (const m of inputs)
      declare(
        m.id,
        m.id.replace(/-/g, " "),
        m.id === "charcoal" ? "fuel" : "ore",
        row.price
      );
    Item.get(stock).made(
      "smith",
      [...inputs, { id: "charcoal", qty: 1 }],
      tier < OPEN_TIERS
    );
  }
  for (const of of ["wood", "hide"] as const)
    declare(
      slug(row[of]),
      cap(row[of]),
      GROUP_OF[of],
      Math.round(20 * row.price)
    );
}

// ── a row's pieces, in every grade ────────────────────────────────────────
function pieces(row: Row) {
  for (const [kind, w] of Object.entries(WEAPONS)) {
    const mat = row[w.of];
    for (const grade of GRADES)
      new Weapon(
        variantId(`${slug(mat)}-${kind}`, grade),
        pieceName(mat, kind, grade),
        w.type,
        Math.round(w.dmg * row.power * GRADE_MULT[grade]),
        {
          reqLevel: row.level,
          price: Math.round(w.price * row.price * GRADE_MULT[grade]),
          grade,
        }
      ).made(CRAFT_OF[w.of], needs(row, w.parts));
  }
  for (const [kind, a] of Object.entries(ARMOR)) {
    const mat = row[a.of];
    for (const grade of GRADES)
      new Armor(
        variantId(`${slug(mat)}-${kind}`, grade),
        pieceName(mat, kind, grade),
        a.group,
        Math.round(a.def * row.power * GRADE_MULT[grade]),
        {
          reqLevel: row.level,
          price: Math.round(a.price * row.price * GRADE_MULT[grade]),
          grade,
        }
      ).made(CRAFT_OF[a.of], needs(row, a.parts));
  }
}

METALS.forEach((row, tier) => {
  materials(row, tier);
  pieces(row);
});

// the window's shelf for a tier — the normal pieces, ids unchanged
export const shelf = (tier: number) =>
  [...Object.entries(WEAPONS), ...Object.entries(ARMOR)].map(
    ([kind, p]) => `${slug(METALS[tier][p.of])}-${kind}`
  );

import type { GameState } from "@/state/types";
import { Item, GRADES, type Grade, type Craft } from "@/models/item";
import { variantId } from "@/data/items/forge";
import { held } from "./classes";
import { count, takeItem, giveItem } from "./inventory";
import { notify } from "./notices";

// A thing that can be made: the normal-grade piece; its graded variants hang off it.
export interface Make {
  id: string;
  name: string;
  craft: Craft;
  needs: string; // "2 iron · 1 leather · 1 charcoal"
  materials: { id: string; qty: number }[];
}

const STRIKES = 7; // heat 1 · draw 3 · quench 1 · finish 2 — a perfect piece
const ix = (g: Grade) => GRADES.indexOf(g);
const TOP = GRADES.length - 1;

export const canCraft = (s: GameState, craft: Craft) =>
  held(s).some((c) => c.crafts.includes(craft)); // a craft you learned stays learned, whatever name is on top

// one above the grade of your best class in that craft; Phantasm gear only from a Phantasm-grade crafter
const classCeiling = (s: GameState, craft: Craft): number => {
  const mine = held(s).filter((c) => c.crafts.includes(craft));
  if (!mine.length) return 0;
  const c = Math.max(...mine.map((k) => ix(k.grade)));
  return c === TOP ? TOP : Math.min(c + 1, TOP - 1);
};

export const missing = (s: GameState, r: Make) =>
  r.materials
    .filter((m) => count(s.bag, m.id) < m.qty)
    .map((m) => Item.get(m.id).name.toLowerCase());

// floor: the combined grade of what went in · ceiling: one above the best, capped by the class
export const gradeWindow = (s: GameState, r: Make) => {
  const grades = r.materials.flatMap((m) =>
    Array<number>(m.qty).fill(ix(Item.get(m.id).grade))
  );
  const lo = Math.floor(grades.reduce((a, b) => a + b, 0) / grades.length);
  const hi = Math.max(
    lo,
    Math.min(Math.max(...grades) + 1, classCeiling(s, r.craft))
  );
  return { lo, hi, floor: GRADES[lo], ceiling: GRADES[hi] };
};

// the piece comes out where the hands put it in the window; a cracked quench costs a grade
export const craft = (
  s: GameState,
  r: Make,
  hits: number,
  quenched: boolean
): GameState => {
  const w = gradeWindow(s, r);
  const earned = Math.round((hits / STRIKES) * (w.hi - w.lo));
  const at = Math.max(w.lo, Math.min(w.hi, w.lo + earned - (quenched ? 0 : 1)));
  let bag = s.bag;
  for (const m of r.materials) bag = takeItem(bag, m.id, m.qty);
  const made = Item.registry.get(variantId(r.id, GRADES[at])) ?? Item.get(r.id);
  return notify(
    {
      ...s,
      bag: giveItem(bag, made.id),
      counters: { ...s.counters, forged: (s.counters.forged ?? 0) + 1 },
    },
    `《Made》 ${made.name}`
  );
};

// what a bench offers: basics for anyone, the rest for the craft's own
export const recipes = (s: GameState, craft: Craft): Make[] =>
  Item.all()
    .filter(
      (it) =>
        it.recipe?.craft === craft &&
        it.grade === "normal" &&
        (it.recipe.basic || canCraft(s, craft))
    )
    .map((it) => ({
      id: it.id,
      name: it.name,
      craft,
      materials: it.recipe!.materials,
      needs: it
        .recipe!.materials.map(
          (m) => `${m.qty} ${Item.get(m.id).name.toLowerCase()}`
        )
        .join(" · "),
    }));

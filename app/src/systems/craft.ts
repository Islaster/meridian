import type { GameState } from "../state/types";
import { Item, GRADES, type Grade, type Craft } from "../data/models/item";
import { variantId } from "../data/items/forge";
import { PlayerClass } from "../data/classes";
import { countItem, takeItem, giveItem } from "./inventory";
import { notify } from "./notices";

export interface Make {
  id: string; // the normal-grade piece; variants hang off it
  name: string;
  craft: Craft;
  needs: string;
  materials: { id: string; qty: number }[];
}

export const STRIKES = 7; // heat 1 · draw 3 · quench 1 · finish 2 — a perfect piece
const ix = (g: Grade) => GRADES.indexOf(g);
const TOP = GRADES.length - 1;

// one above the class's own grade; Phantasm gear only from a Phantasm-grade crafter
export const classCeiling = (s: GameState): number => {
  if (!s.player.class) return 0;
  const c = ix(PlayerClass.get(s.player.class).grade);
  return c === TOP ? TOP : Math.min(c + 1, TOP - 1);
};

export const missing = (s: GameState, r: Make) =>
  r.materials
    .filter((m) => countItem(s.bag, m.id) < m.qty)
    .map((m) => Item.get(m.id).name.toLowerCase());

// floor: the combined grade of what went in · ceiling: one above the best, capped by the class
export const gradeWindow = (s: GameState, r: Make) => {
  const grades = r.materials.flatMap((m) =>
    Array<number>(m.qty).fill(ix(Item.get(m.id).grade))
  );
  const lo = Math.floor(grades.reduce((a, b) => a + b, 0) / grades.length);
  const hi = Math.max(lo, Math.min(Math.max(...grades) + 1, classCeiling(s)));
  return { lo, hi, floor: GRADES[lo], ceiling: GRADES[hi] };
};

export const variant = (r: Make, grade: Grade): Item =>
  Item.registry.get(variantId(r.id, grade)) ?? Item.get(r.id);

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
  const made = variant(r, GRADES[at]);
  bag = giveItem(bag, made.id);
  return notify(
    {
      ...s,
      bag,
      counters: { ...s.counters, forged: (s.counters.forged ?? 0) + 1 },
    },
    `《Made》 ${made.name}`
  );
};

export const canCraft = (s: GameState, craft: Craft) =>
  !!s.player.class && PlayerClass.get(s.player.class).crafts.includes(craft);

export const recipes = (s: GameState, craft: Craft): Make[] =>
  [...Item.registry.values()]
    .filter(
      (it) =>
        it.recipe?.craft === craft &&
        it.grade === "normal" &&
        (it.recipe!.basic || canCraft(s, craft)) // basics for anyone; gear for the craft's own
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

import { Weapon } from "@/models/item";

// starting junk · tier 0
new Weapon(
  "walking-stick",
  "Walking stick",
  "club",
  2
).made("fletch", [
  { id: "driftwood", qty: 1 },
  { id: "kelp-fiber", qty: 1 },
]);
new Weapon(
  "belt-knife",
  "Belt knife",
  "sword",
  3
).made("smith", [
  { id: "copper", qty: 1 },
  { id: "cloth", qty: 1 },
  { id: "charcoal", qty: 1 },
]);
new Weapon("rusty-blade", "Rusty blade", "sword", 4, {
  price: 15,
}); // found: rust isn't made
new Weapon(
  "hunting-bow",
  "Hunting bow",
  "bow",
  4
).made("fletch", [
  { id: "driftwood", qty: 2 },
  { id: "kelp-fiber", qty: 1 },
  { id: "pine-resin", qty: 1 },
]);
new Weapon(
  "goblin-sling",
  "Goblin sling",
  "bow",
  3,
  { price: 20 }
); // goblin-made: found

// town gear
new Weapon("iron-sword", "Iron sword", "sword", 6, {
  reqStats: { str: 7 },
  price: 60,
}).made("smith", [
  { id: "iron", qty: 2 },
  { id: "leather", qty: 1 },
  { id: "charcoal", qty: 1 },
]);
new Weapon("wood-axe", "Wood axe", "axe", 7, {
  reqStats: { str: 8 },
  price: 55,
}).made("smith", [
  { id: "iron", qty: 1 },
  { id: "ash", qty: 1 },
  { id: "charcoal", qty: 1 },
]);
new Weapon("short-bow", "Short bow", "bow", 5, {
  reqStats: { dex: 7 },
  price: 60,
}).made("fletch", [
  { id: "ash", qty: 2 },
  { id: "kelp-fiber", qty: 1 },
  { id: "pine-resin", qty: 1 },
]);

// shop · the kiln yard's smiths left good steel behind
new Weapon(
  "kilnsteel-sword",
  "Kilnsteel sword",
  "sword",
  9,
  { reqLevel: 4, price: 140 }
).made("smith", [
  { id: "steel", qty: 2 },
  { id: "leather", qty: 1 },
  { id: "charcoal", qty: 1 },
]);
new Weapon("hand-axe", "Hand axe", "axe", 10, {
  reqLevel: 4,
  reqStats: { str: 7 },
  price: 130,
}).made("smith", [
  { id: "iron", qty: 1 },
  { id: "yew", qty: 1 },
  { id: "charcoal", qty: 1 },
]);

// found · best for someone — authored on top of the grid, never made
new Weapon(
  "hales-blade",
  "Hale's blade",
  "sword",
  6,
  {
    grade: "rare",
    perks: [{ kind: "scaling", stat: "lck", per: 0.5, from: 5 }],
    describe:
      "Hale's. The edge finds the gap it has no business finding — the luckier you are, the more often.",
  }
);
new Weapon(
  "alphas-fang",
  "The alpha's fang",
  "knife",
  6,
  {
    reqLevel: 4,
    grade: "rare",
    price: 90,
    perks: [{ kind: "scaling", stat: "agi", per: 0.5, from: 5 }],
    describe:
      "The alpha's own tooth, set in a grip. Quick hands make it quicker.",
  }
);
new Weapon("rime-edge", "Rime edge", "sword", 10, {
  reqLevel: 5,
  grade: "rare",
  price: 160,
  perks: [{ kind: "scaling", stat: "int", per: 0.5, from: 5 }],
  describe:
    "Rime glass worked into a blade that never warms. It cuts cleaner the more you understand it.",
});

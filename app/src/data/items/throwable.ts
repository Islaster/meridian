import { Throwable } from "../../models/item";

export const oilFlask = new Throwable(
  "oil-flask",
  "Oil flask",
  "oil",
  10,
  8
).made("alchemy", [
  { id: "pine-resin", qty: 2 },
  { id: "kelp-fiber", qty: 1 },
]); // resin oil, a wick
export const bomb = new Throwable("bomb", "Bomb", "bomb", 18, 20).made(
  "alchemy",
  [
    { id: "charcoal", qty: 2 },
    { id: "salt-crystal", qty: 1 },
    { id: "cinder-ore", qty: 1 },
    { id: "kelp-fiber", qty: 1 },
  ]
); // the ore that glows, a fuse

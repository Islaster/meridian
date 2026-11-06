import { Armor } from "../../models/item";

// starting · tier 0
export const travelerClothes = new Armor(
  "traveler-clothes",
  "Traveler's clothes",
  "clothes",
  1
).made("tailor", [
  { id: "cloth", qty: 2 },
  { id: "kelp-fiber", qty: 1 },
]);
export const wornBoots = new Armor("worn-boots", "Worn boots", "boots", 1); // found: worn isn't made
export const travelerCloak = new Armor(
  "traveler-cloak",
  "Traveler's cloak",
  "cloak",
  1,
  { price: 20 }
).made("tailor", [
  { id: "cloth", qty: 2 },
  { id: "kelp-fiber", qty: 1 },
]);

// town gear
export const leatherCap = new Armor("leather-cap", "Leather cap", "helmet", 2, {
  price: 30,
}).made("tailor", [
  { id: "leather", qty: 1 },
  { id: "kelp-fiber", qty: 1 },
]);
export const leatherJerkin = new Armor(
  "leather-jerkin",
  "Leather jerkin",
  "jerkin",
  4,
  { reqStats: { end: 6 }, price: 70 }
).made("tailor", [
  { id: "leather", qty: 2 },
  { id: "kelp-fiber", qty: 1 },
]);
export const quiltedRobe = new Armor(
  "quilted-robe",
  "Quilted robe",
  "robe",
  2,
  { reqStats: { int: 6 }, price: 60 }
).made("tailor", [
  { id: "cloth", qty: 3 },
  { id: "kelp-fiber", qty: 1 },
]);
export const ratHideGloves = new Armor(
  "rat-hide-gloves",
  "Rat-hide gloves",
  "gloves",
  1,
  { price: 25 }
); // cellar find: no rat hide exists to make it from
export const crabShellShield = new Armor(
  "crab-shell-shield",
  "Crab-shell shield",
  "shield",
  3,
  { reqStats: { str: 6 }, price: 80 }
).made("fletch", [
  { id: "crab-shell", qty: 2 },
  { id: "ash", qty: 1 },
  { id: "kelp-fiber", qty: 1 },
]);
export const wolfPeltCloak = new Armor(
  "wolf-pelt-cloak",
  "Wolf-pelt cloak",
  "cloak",
  2,
  { price: 60 }
).made("tailor", [
  { id: "wolf-pelt", qty: 2 },
  { id: "kelp-fiber", qty: 1 },
]);

// shop · tier 1 set ≈ 400 with a weapon
export const feltCap = new Armor("felt-cap", "Felt cap", "helmet", 2, {
  reqLevel: 3,
  price: 40,
}).made("tailor", [
  { id: "cloth", qty: 2 },
  { id: "kelp-fiber", qty: 1 },
]);
export const bearHideCoat = new Armor(
  "bear-hide-coat",
  "Bear-hide coat",
  "jerkin",
  5,
  { reqLevel: 4, price: 110 }
).made("tailor", [
  { id: "bear-hide", qty: 2 },
  { id: "kelp-fiber", qty: 1 },
]);
export const furLinedBoots = new Armor(
  "fur-lined-boots",
  "Fur-lined boots",
  "boots",
  2,
  { reqLevel: 3, price: 45 }
).made("tailor", [
  { id: "leather", qty: 1 },
  { id: "wolf-pelt", qty: 1 },
  { id: "kelp-fiber", qty: 1 },
]);
export const ironBuckler = new Armor(
  "iron-buckler",
  "Iron buckler",
  "shield",
  3,
  { reqLevel: 3, price: 70 }
).made("smith", [
  { id: "iron", qty: 1 },
  { id: "ash", qty: 1 },
  { id: "charcoal", qty: 1 },
]);
export const rimeRing = new Armor("rime-ring", "Rime ring", "ring", 1, {
  reqLevel: 3,
  price: 60,
}).made("smith", [
  { id: "copper", qty: 1 },
  { id: "rime-glass", qty: 1 },
  { id: "charcoal", qty: 1 },
]);

// drop
export const frostElfHood = new Armor(
  "frost-elf-hood",
  "Frost elf hood",
  "headband",
  2,
  { reqLevel: 4, grade: "rare", price: 80 }
);

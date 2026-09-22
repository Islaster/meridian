import { Armor } from "../models/item";
export const travelerClothes = new Armor(
  "traveler-clothes",
  "Traveler's clothes",
  "armor",
  1
);
export const wornBoots = new Armor("worn-boots", "Worn boots", "boots", 1);
export const travelerCloak = new Armor(
  "traveler-cloak",
  "Traveler's cloak",
  "back",
  1,
  { price: 20 }
);
export const leatherJerkin = new Armor(
  "leather-jerkin",
  "Leather jerkin",
  "armor",
  4,
  { reqStats: { end: 6 }, price: 70 }
);
export const quiltedRobe = new Armor(
  "quilted-robe",
  "Quilted robe",
  "armor",
  2,
  { reqStats: { int: 6 }, price: 60 }
);
export const leatherCap = new Armor("leather-cap", "Leather cap", "head", 2, {
  price: 30,
});
export const copperRing = new Armor("copper-ring", "Copper ring", "ring", 0, {
  price: 25,
});

import { Armor } from "../../models/item";

export const travelerClothes = new Armor(
  "traveler-clothes",
  "Traveler's clothes",
  "clothes",
  1
);
export const wornBoots = new Armor("worn-boots", "Worn boots", "boots", 1);
export const travelerCloak = new Armor(
  "traveler-cloak",
  "Traveler's cloak",
  "cloak",
  1,
  { price: 20 }
);
export const leatherCap = new Armor("leather-cap", "Leather cap", "helmet", 2, {
  price: 30,
});
export const leatherJerkin = new Armor(
  "leather-jerkin",
  "Leather jerkin",
  "jerkin",
  4,
  { reqStats: { end: 6 }, price: 70 }
);
export const quiltedRobe = new Armor(
  "quilted-robe",
  "Quilted robe",
  "robe",
  2,
  { reqStats: { int: 6 }, price: 60 }
);
export const copperRing = new Armor("copper-ring", "Copper ring", "ring", 0, {
  price: 25,
});
export const ratHideGloves = new Armor(
  "rat-hide-gloves",
  "Rat-hide gloves",
  "gloves",
  1,
  { price: 25 }
);
export const crabShellShield = new Armor(
  "crab-shell-shield",
  "Crab-shell shield",
  "shield",
  3,
  { reqStats: { str: 6 }, price: 80 }
);
export const wolfPeltCloak = new Armor(
  "wolf-pelt-cloak",
  "Wolf-pelt cloak",
  "cloak",
  2,
  { price: 60 }
);

// shop · tier 1 set ≈ 400 with a weapon
export const feltCap = new Armor("felt-cap", "Felt cap", "helmet", 2, {
  reqLevel: 3,
  price: 40,
});

export const bearHideCoat = new Armor(
  "bear-hide-coat",
  "Bear-hide coat",
  "jerkin",
  5,
  { reqLevel: 4, price: 110 }
);

export const furLinedBoots = new Armor(
  "fur-lined-boots",
  "Fur-lined boots",
  "boots",
  2,
  { reqLevel: 3, price: 45 }
);

export const ironBuckler = new Armor(
  "iron-buckler",
  "Iron buckler",
  "shield",
  3,
  { reqLevel: 3, price: 70 }
);

export const rimeRing = new Armor("rime-ring", "Rime ring", "ring", 1, {
  reqLevel: 3,
  price: 60,
});

// drop
export const frostEflHood = new Armor(
  "frost-elf-hood",
  "Frost elf hood",
  "headband",
  2,
  { reqLevel: 4, grade: "rare", price: 80 }
);
if (import.meta.hot) import.meta.hot.accept();

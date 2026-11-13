import type { Requirement } from "@/models/quest";
import type { Grade } from "@/models/item";

export type Spot = {
  id: string; // action id
  at: string | string[]; // fixed: one place · rare: the places it can turn up — the day picks one
  grade?: Grade; // rare and above: dealt by the day, needs the craft class to work
  odds?: number; // base chance per day, before the ledger moves it (default 0.15)
  label: string;
  text: string;
  material: string; // item id — must exist in data/items
  kind: "ore" | "wood" | "herb" | "fuel";
  rich: number[]; // yield per hour; the day picks one
  cap: number; // hours per day
  requires?: Requirement;
};

const THIN = [1, 2, 1, 2]; // town spots: never nothing, never a living
const FAIR = [2, 3, 2, 4]; // a walk out
const RICH = [3, 4, 3, 5]; // behind a gate

export const SPOTS: Spot[] = [
  // ore — one row of the metal ladder each, each a step further from the forge
  {
    id: "rake-out",
    at: "the-kilns",
    label: "Rake out the kiln",
    text: "Charcoal from last night's burn.",
    material: "charcoal",
    kind: "fuel",
    rich: FAIR,
    cap: 2,
  },
  {
    id: "streak",
    at: "the-shingle",
    label: "Chip at the green streak",
    text: "Copper shows green where the cliff weeps.",
    material: "copper-ore",
    kind: "ore",
    rich: FAIR,
    cap: 2,
  },
  {
    id: "gravel",
    at: "kiln-road",
    label: "Stream the gravel",
    text: "Tin in the Calder's bed where the road fords it.",
    material: "tin-ore",
    kind: "ore",
    rich: FAIR,
    cap: 3,
  },
  {
    id: "kilns-vein",
    at: "kilns-cold",
    label: "Work the kilns' vein",
    text: "Blue-black ore in the frost.",
    material: "iron-ore",
    kind: "ore",
    rich: RICH,
    cap: 3,
  },
  // wood
  {
    id: "coppice",
    at: "the-butts",
    label: "Cut staves in the coppice",
    text: "Ash, straight enough to bend.",
    material: "ash",
    kind: "wood",
    rich: THIN,
    cap: 2,
  },
  {
    id: "pines",
    at: "kiln-road",
    label: "Cut yew on the switchbacks",
    text: "Upland yew, the bow wood.",
    material: "yew",
    kind: "wood",
    rich: FAIR,
    cap: 3,
  },
  // herbs and reagents
  {
    id: "garden",
    at: "the-stillroom",
    label: "Cut herbs in the garden",
    text: "Hesper's beds; take what's grown.",
    material: "sea-wormwood",
    kind: "herb",
    rich: THIN,
    cap: 2,
  },
  {
    id: "tideline",
    at: "the-shingle",
    label: "Rake the tideline",
    text: "Kelp and salt, left by the ebb.",
    material: "kelp-fiber",
    kind: "herb",
    rich: THIN,
    cap: 2,
  },
  {
    id: "tide-pools",
    at: "tide-cave",
    label: "Work the tide pools",
    text: "Salt crusts the rock where the pools dry.",
    material: "salt-crystal",
    kind: "herb",
    rich: FAIR,
    cap: 3,
  },
  {
    id: "green-glass",
    at: ["the-shingle", "kiln-road", "kilns-cold"],
    label: "Pry out the green glass",
    text: "Ore grown through with glass. It wasn't here yesterday.",
    material: "rime-glass",
    kind: "ore",
    grade: "rare",
    rich: THIN,
    cap: 1,
  },
];

export const spot = (id: string) => {
  const s = SPOTS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown spot: ${id}`);
  return s;
};

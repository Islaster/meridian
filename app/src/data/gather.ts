import type { Requirement } from "./models/quest";

export type Spot = {
  id: string; // action id
  at: string; // location or dungeon id
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
    at: "kiln-yard",
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
    id: "cut",
    at: "kiln-road",
    label: "Work the cut",
    text: "An hour with the pick on the switchbacks.",
    material: "iron-ore",
    kind: "ore",
    rich: FAIR,
    cap: 3,
  },
  {
    id: "kilns-vein",
    at: "kilns-cold",
    label: "Work the kilns' vein",
    text: "Blue-black ore in the frost.",
    material: "rime-steel-ore",
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
    material: "ash-stave",
    kind: "wood",
    rich: THIN,
    cap: 2,
  },
  {
    id: "pines",
    at: "kiln-road",
    label: "Fell a pine",
    text: "Mountain pine; heavy, slow to split.",
    material: "pine-stave",
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
    material: "sorrel",
    kind: "herb",
    rich: THIN,
    cap: 2,
    requires: { flags: ["met:hesper-quill"] },
  },
  {
    id: "tideline",
    at: "the-shingle",
    label: "Rake the tideline",
    text: "Kelp and salt, left by the ebb.",
    material: "sea-kelp",
    kind: "herb",
    rich: THIN,
    cap: 2,
  },
  {
    id: "tide-pools",
    at: "tide-cave",
    label: "Work the tide pools",
    text: "Brine-flowers under the cold water.",
    material: "brine-flower",
    kind: "herb",
    rich: FAIR,
    cap: 3,
  },
];

export const spot = (id: string) => {
  const s = SPOTS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown spot: ${id}`);
  return s;
};

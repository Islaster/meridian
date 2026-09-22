import { Quest } from "../models/quest";

export const theInheritance = new Quest(
  "the-inheritance",
  "main",
  "The inheritance",
  [
    {
      objective:
        "Find Hale's apothecary on harbor row. The key is in your bag.",
      narration:
        "The letter came with a key and an address: Hale's apothecary, harbor row. A relative you never met, a shop you've never seen.",
      complete: { kind: "visit", location: "workshop" },
      give: ["predecessor-journal"],
    },
    {
      objective:
        "Take the journal to Pell Marrow at the Charter Guild, on the square. The Guild opens at eight.",
      narration:
        "The bench is as he left it, a flask half-filled. In the drawer, a journal. The last pages are about a debt — owed to the Charter Guild, and a clerk named Pell Marrow.",
      complete: { kind: "talk", npc: "pell-marrow" },
    },
    {
      objective: "Go home and read the rest of the journal.",
      narration:
        'Pell reads two pages and closes the book. "Osric owed Aldous Fenn. Fenn holds a lien on the shop — until it\'s settled, you sleep there by courtesy." He slides it back. "He was looking for something in the tide cave. Go home. Read the rest."',
      complete: { kind: "visit", location: "workshop" },
    },
  ],
  {
    reward: { xp: 20 },
    next: "the-tide-cave",
    epilogue:
      "The last entry is a map, roughly drawn: a cave north along the coast road, under the old breakwater, reachable at low tide. Beside it, a name — Ira Vell — and a question mark.",
  }
);

export const theTideCave = new Quest(
  "the-tide-cave",
  "main",
  "The tide cave",
  [
    {
      objective:
        "The cave is north on the coast road, under the old breakwater. Low tide is morning.",
      complete: { kind: "have", item: "predecessor-journal" },
      unlock: ["tide-cave"],
    },
    {
      objective:
        "Wenna Tarrow at the Gull & Lamp knew Osric. She opens at noon.",
      complete: { kind: "talk", npc: "wenna-tarrow" },
    },
    {
      objective: "Choose what to carry.",
      narration:
        '"Kin," Wenna says, looking at you longer than she needs to. "He left some things here. Take one lot — you\'ll want it where you\'re going."',
      complete: { kind: "armed" },
    },
    {
      objective:
        "The cave is north on the coast road, under the old breakwater. Low tide is morning.",
      narration:
        "Osric's map, his gear, the morning tide. Nothing left to wait for.",
      complete: { kind: "clear", dungeon: "tide-cave" },
    },
    {
      objective: "Clear the cave.",
      narration: "The cave is not empty.",
      complete: { kind: "clear", dungeon: "tide-cave" },
    },
  ],
  { reward: { xp: 40, gold: 30 } }
);

export const somethingInTheCellar = new Quest(
  "something-in-the-cellar",
  "side",
  "Something in the cellar",
  [
    {
      objective:
        "Clear the rats from the apothecary's cellar. The trapdoor is behind the counter.",
      narration:
        '"Rats," Wenna says. "Came up after the wave and never left Osric\'s stores. He\'d have paid you to deal with them. I will."',
      complete: { kind: "clear", dungeon: "apothecary-cellar" },
    },
  ],
  { reward: { gold: 15, items: ["minor-potion"] } }
);

export const wolvesOnTheKilnRoad = new Quest(
  "wolves-on-the-kiln-road",
  "bounty",
  "Wolves on the Kiln road",
  [
    {
      objective:
        "Hunt the pack on the Kiln road. They come down at dusk; take the coast road north and follow the switchbacks.",
      narration:
        '"By the pelt," Tamsin says, not looking up from the bowstring. "Dusk. Bring a light or don\'t bother."',
      complete: { kind: "clear", dungeon: "kiln-road" },
    },
  ],
  { reward: { gold: 40, items: ["wolf-pelt"] } }
);

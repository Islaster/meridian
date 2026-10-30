import { Quest } from "../../../../models/quest";

new Quest(
  "find-the-hall",
  "main",
  "Find the hall",
  "Find Hale's training on harbor row. The key is in your bag.",
  { kind: "visit", location: "hall" },
  {
    chain: "The inheritance",
    give: ["predecessor-journal"],
    narration:
      "The bench is as he left it, a flask half-filled. In the drawer, a journal. The last pages are about a debt — owed to the Charter Guild, and a clerk named Pell Marrow.",
    next: "journal-to-pell",
  }
);

new Quest(
  "read-the-rest",
  "main",
  "The inheritance",
  "Go home and read the rest of the journal.",
  { kind: "visit", location: "hall" },
  {
    chain: "The inheritance",
    reward: { xp: 20 },
    epilogue:
      "The last entry is a map, roughly drawn: a cave north along the coast road, under the old breakwater, reachable at low tide. Beside it, a name — Ira Vell — and a question mark.",
    next: "talk-wenna",
  }
);

new Quest(
  "tell-dunny",
  "side",
  "Tell Dunny",
  "Tell Dunny what you found.",
  { kind: "talk", npc: "dunny-crake" },
  {
    chain: "The breakwater lamp",
    reward: { items: ["oil-flask", "oil-flask"] },
    epilogue:
      'Dunny swears at no one in particular and pushes two flasks across the counter. "Then you\'ll need these more than I do."',
  }
);

if (import.meta.hot) import.meta.hot.accept();

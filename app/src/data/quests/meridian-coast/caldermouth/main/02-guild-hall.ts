import { Quest } from "../../../../../models/quest";

new Quest(
  "journal-to-pell",
  "main",
  "The journal",
  "Take the journal to Pell Marrow at the Charter Guild, on the square. The Guild opens at eight.",
  { kind: "talk", npc: "pell-marrow" },
  {
    chain: "The inheritance",
    narration:
      'Pell reads two pages and closes the book. "Osric owed Aldous Fenn. Fenn holds a lien on the shop — until it\'s settled, you sleep there by courtesy." He slides it back. "He was looking for something in the tide cave. Go home. Read the rest."',
    next: "read-the-rest",
  }
);

new Quest(
  "iras-answer",
  "side",
  "Ira's answer",
  "Take Ira's answer back to Pell at the Guild hall.",
  { kind: "talk", npc: "pell-marrow" },
  {
    chain: "A notice for the yard",
    reward: { xp: 8, gold: 10 },
    epilogue:
      'Pell\'s mouth thins. "He always says that." A coin, counted twice, for your trouble.',
  }
);

new Quest(
  "fenns-lien",
  "main",
  "Fenn's lien",
  "Ask Pell Marrow what Fenn's lien actually means.",
  { kind: "talk", npc: "pell-marrow" },
  {
    chain: "The lien",
    visible: { complete: ["the-tide-cave"] },
    narration:
      '"A hundred and twenty gold," Pell says, not looking it up. "Osric\'s debt, Fenn\'s paper, your roof. Settle it and the deed reads your name. Don\'t, and one morning it reads his." A pause. "The Guild buys what the deep gives up. That\'s not advice."',
    next: ["the-main-desk", "settle-the-lien"],
  }
);

new Quest(
  "settle-the-lien",
  "main",
  "Settle the lien",
  "Bring 12,000 gold to the Charter Guild and pay off Fenn's lien.",
  { kind: "flag", flag: "act:pay-lien" },
  {
    chain: "The lien",
    reward: { xp: 30 },
    epilogue:
      "Pell counts it twice, stamps a page, and slides a paper across the brass. Your name, in the Guild's hand, on the deed to a shop on harbor row. The first thing you have ever owned that could be taken from you.",
  }
);

new Quest(
  "the-main-desk",
  "main",
  "The main desk",
  "Pell keeps the licenses at the main desk. Fifty gold, and the Guild has a name for you.",
  { kind: "flag", flag: "act:license" },
  {
    chain: "The Guild",
    narration:
      "Rank F. The lowest rung the Guild has a name for. It gets you through the gates the Guild keeps, and onto the board.",
    next: "first-posting",
  }
);

new Quest(
  "first-posting",
  "main",
  "The first posting",
  "Take the kiln road posting off the board, clear the den, and come back with it done.",
  { kind: "flag", flag: "cleared:kilns-cold" },
  {
    chain: "The Guild",
    reward: { xp: 40 },
    epilogue:
      "Pell stamps the posting without reading it. \"The board turns every few days. What the deep gives up, the window buys.\" That's the whole arrangement, and it's enough to live on.",
    track: [{ board: "clear-the-kilns-cold" }, { dungeon: "kilns-cold" }],
  }
);

if (import.meta.hot) import.meta.hot.accept();

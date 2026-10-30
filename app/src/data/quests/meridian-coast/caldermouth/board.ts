import { Quest } from "../../../../models/quest";

// ── Postings · the Guild's board ───────────────────────────────────────────
new Quest(
  "clear-the-tide-cave",
  "mission",
  "The tide cave, again",
  "Clear the tide cave for the Guild's surveyors. Posted every third day while the goblins keep coming back.",
  { kind: "clear", dungeon: "tide-cave" },
  {
    reward: { gold: 60, xp: 20 },
    repeat: 3,
    visible: { complete: ["the-tide-cave"] },
    acceptable: { rank: 1 },
  }
);
new Quest(
  "clear-the-kilns-cold",
  "mission",
  "The den in the cold kilns",
  "Clear the den on the kiln road. The Guild posts it again whenever the wolves come back.",
  { kind: "clear", dungeon: "kilns-cold" },
  {
    reward: { gold: 90, xp: 25 },
    repeat: 3,
    visible: { complete: ["the-main-desk"] },
    acceptable: { rank: 1 },
  }
);
if (import.meta.hot) import.meta.hot.accept();

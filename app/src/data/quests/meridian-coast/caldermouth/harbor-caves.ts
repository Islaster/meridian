import { Quest } from "../../../../models/quest";

new Quest(
  "the-harbor-caves",
  "main",
  "The harbor caves",
  "Go into the caves under the harbor and take back what was Osric's.",
  { kind: "clear", dungeon: "harbor-caves" },
  {
    chain: "The Gullwrights",
    reward: { xp: 60, gold: 40, items: ["cinder-ore"] },
    epilogue:
      'Sable Wrenn, bleeding, laughing. "You\'re his, all right. He had that look." She spits. "Kept asking about the doors. Everyone told him to stop. Take your crate." The crate holds ore that glows faintly in the dark, and a page torn from a journal you\'ve read.',
  }
);

if (import.meta.hot) import.meta.hot.accept();

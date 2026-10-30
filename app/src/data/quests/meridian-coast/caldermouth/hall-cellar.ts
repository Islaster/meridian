import { Quest } from "../../../../models/quest";

new Quest(
  "something-in-the-cellar",
  "side",
  "Something in the cellar",
  "Clear the rats from the training hall's cellar. The trapdoor is behind the counter.",
  { kind: "clear", dungeon: "hall-cellar" },
  {
    visible: { complete: ["find-the-hall"] },
    reward: { gold: 15, items: ["minor-potion"] },
    epilogue:
      "Wenna doesn't ask how many. She sets a coin and a stoppered bottle on the bar and goes back to the lamp.",
  }
);

if (import.meta.hot) import.meta.hot.accept();

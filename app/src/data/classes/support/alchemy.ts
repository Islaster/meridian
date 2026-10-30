import { PlayerClass } from "../../../models/class";

export const apprenticeAlchemist = new PlayerClass(
  "apprentice-alchemist",
  "Apprentice alchemist",
  "inferiority",
  {
    lineage: "support",
    crafts: ["alchemy"],
    describe: "Keeps the still lit and the measures honest. Mostly.",
    master: "hesper-quill",
  }
);
export const alchemist = new PlayerClass("alchemy", "Alchemist", "normal", {
  lineage: "support",
  crafts: ["alchemy"],
  describe: "Measures. Everything is measures.",
  master: "hesper-quill",
  floor: { int: 7 },
});

if (import.meta.hot) import.meta.hot.accept();

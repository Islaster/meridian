import { PlayerClass } from "@/models/class";

new PlayerClass(
  "apprentice-alchemist",
  "Apprentice alchemist",
  "inferiority",
  {
    lineage: "support",
    crafts: ["alchemy"],
    describe: "Keeps the still lit and the measures honest. Mostly.",
    master: "hesper-quill",
    level: 2,
  }
);
new PlayerClass("alchemy", "Alchemist", "normal", {
  lineage: "support",
  crafts: ["alchemy"],
  describe: "Measures. Everything is measures.",
  master: "hesper-quill",
  level: 4,
  floor: { int: 7 },
});

import { PlayerClass } from "@/models/class";

// ── The forge ──────────────────────────────────────────────────────────────
new PlayerClass(
  "apprentice-smith",
  "Apprentice smith",
  "inferiority",
  {
    lineage: "support",
    crafts: ["smith"],
    describe: "Bellows, buckets, and the odd mended pot.",
    master: "tobin-ashe",
    level: 2,
  }
);
new PlayerClass("smith", "Blacksmith", "normal", {
  lineage: "support",
  crafts: ["smith"],
  describe: "Iron, fire, and the patience to do it again.",
  master: "tobin-ashe",
  level: 4,
  floor: { str: 7 },
});

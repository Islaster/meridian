import { PlayerClass } from "../../../models/class";

// ── The forge ──────────────────────────────────────────────────────────────
export const apprenticeSmith = new PlayerClass(
  "apprentice-smith",
  "Apprentice smith",
  "inferiority",
  {
    lineage: "support",
    crafts: ["smith"],
    describe: "Bellows, buckets, and the odd mended pot.",
    master: "tobin-ashe",
  }
);
export const blacksmith = new PlayerClass("smith", "Blacksmith", "normal", {
  lineage: "support",
  crafts: ["smith"],
  describe: "Iron, fire, and the patience to do it again.",
  master: "tobin-ashe",
  floor: { str: 7 },
});

if (import.meta.hot) import.meta.hot.accept();

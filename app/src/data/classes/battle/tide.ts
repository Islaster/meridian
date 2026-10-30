import { PlayerClass } from "../../../models/class";

// ── The tide · Orrin's discipline ──────────────────────────────────────────
export const wader = new PlayerClass("wader", "Wader", "inferiority", {
  lineage: "battle",
  pool: "mana",
  medium: "tide",
  describe: "Knows which way the water pulls. Not yet why.",
  master: "orrin-vey",
  skills: ["spray", "cold-salve"],
  starts: ["spray"],
});
export const tidecaller = new PlayerClass("tide", "Tidecaller", "normal", {
  lineage: "battle",
  pool: "mana",
  medium: "tide",
  describe: "The sea doesn't want. It pulls. So do you.",
  master: "orrin-vey",
  skills: ["brine-lash", "still-water", "undertow"],
  starts: ["brine-lash"],
  floor: { int: 7 },
});

if (import.meta.hot) import.meta.hot.accept();

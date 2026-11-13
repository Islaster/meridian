import { PlayerClass } from "@/models/class";

// ── The tide · Orrin's discipline ──────────────────────────────────────────
new PlayerClass("wader", "Wader", "inferiority", {
  lineage: "battle",
  pool: "mana",
  medium: "tide",
  describe: "Knows which way the water pulls. Not yet why.",
  master: "orrin-vey",
  level: 4,
  skills: ["spray", "cold-salve"],
  starts: ["spray"],
});
new PlayerClass("tide", "Tidecaller", "normal", {
  lineage: "battle",
  pool: "mana",
  medium: "tide",
  describe: "The sea doesn't want. It pulls. So do you.",
  master: "orrin-vey",
  level: 6,
  skills: ["brine-lash", "still-water", "undertow"],
  starts: ["brine-lash"],
  floor: { int: 7 },
});

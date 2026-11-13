import { PlayerClass } from "@/models/class";

new PlayerClass("scout", "Scout", "inferiority", {
  lineage: "battle",
  pool: "ki",
  medium: "bow",
  describe: "Sees first, shoots second, leaves before anyone asks.",
  master: "maud-kestrel",
  level: 3,
  skills: ["snap-shot", "steady"],
  starts: ["snap-shot"],
});
new PlayerClass("bow", "archer", "normal", {
  lineage: "battle",
  pool: "ki",
  medium: "bow",
  describe: "The breath held, the string let go.",
  master: "maud-kestrel",
  level: 5,
  skills: ["measured-shot", "held-breath", "pin-shot"],
  starts: ["measured-shot"],
  floor: { dex: 7 },
});

import { PlayerClass } from "../../models/class";

export const scout = new PlayerClass("scout", "Scout", "inferiority", {
  lineage: "battle",
  pool: "ki",
  medium: "bow",
  describe: "Sees first, shoots second, leaves before anyone asks.",
  master: "maud-kestrel",
  skills: ["snap-shot", "steady"],
  starts: ["snap-shot"],
});
export const bowman = new PlayerClass("bow", "Bowman", "normal", {
  lineage: "battle",
  pool: "ki",
  medium: "bow",
  describe: "The breath held, the string let go.",
  master: "maud-kestrel",
  skills: ["measured-shot", "held-breath", "pin-shot"],
  starts: ["measured-shot"],
  floor: { dex: 7 },
});

if (import.meta.hot) import.meta.hot.accept();

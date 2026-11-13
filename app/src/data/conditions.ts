import { Condition } from "@/models/condition";
import { WEARY } from "@/systems/time";
export { Condition, type Active } from "@/models/condition";

// Every condition the game can put on the player, in one place. `describe` is the rule, in
// the player's words — what it does and by how much — so the sheet can explain it.

new Condition("weary", "Weary", "debuff", {
  describe: `Lowers your highest stat by ${Math.round(
    WEARY * 100
  )}% (at least 1) until you sleep properly. You get it from a night on the ground, or a bed reached past midnight.`,
  ends: "lifts at the next proper night's sleep",
  stats: (a) => ({ [a.stat!]: -a.amount! }),
});

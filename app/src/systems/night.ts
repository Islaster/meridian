import type { GameState } from "../state/types";
import type { Note } from "./types";
import { sleep, WEARY } from "./time";
import { refresh } from "./combat";

export type Bed = "bed" | "camp" | "rough";

// The night. A bed or a camp mends you; the ground doesn't and it shows. A bed reached past midnight shows too.
export const night = (
  s: GameState,
  bed: Bed,
  where: string
): { state: GameState; notes: Note[] } => {
  const weary = bed === "rough" || (bed === "bed" && s.time.hour >= 24);
  let player =
    bed === "rough"
      ? s.player
      : { ...s.player, hp: s.player.maxHp, mp: s.player.maxMp };
  // yesterday's weariness lifts
  if (player.weary) {
    const { stat, amount } = player.weary;
    player = {
      ...player,
      stats: { ...player.stats, [stat]: player.stats[stat] + amount },
      weary: undefined,
    };
  }
  const notes: Note[] = [];
  if (bed === "rough")
    notes.push({
      kind: "story",
      text: `Midnight finds you at ${where}. You sleep where you stand.`,
    });
  if (bed === "camp")
    notes.push({
      kind: "story",
      text: `You unroll the pack at ${where} and sleep inside it. The embers hold till morning.`,
    });
  if (weary) {
    const [stat, value] = Object.entries(player.stats).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const amount = Math.max(1, Math.round(value * WEARY));
    player = {
      ...player,
      stats: { ...player.stats, [stat]: value - amount },
      weary: { stat, amount },
    };
    notes.push({
      kind: "story",
      text: `${
        bed === "rough" ? "A night on the ground" : "Bed past midnight"
      }, and it shows. ${stat.toUpperCase()} is down ${amount} until you sleep properly.`,
    });
  }
  return {
    state: {
      ...s,
      player,
      time: sleep(s.time),
      done: refresh(s.done, s.time.dayId + 1),
    },
    notes,
  };
};

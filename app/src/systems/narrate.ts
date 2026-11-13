import { Quest } from "@/data/quests";
import { Item } from "@/data/items";
import type { GameState } from "@/state/types";
import { GLYPH } from "./quests";

// A line for the scene's log. "complete" and "levelup" also open a card.
export interface Note {
  text: string;
  kind: "story" | "reward" | "complete" | "levelup";
  id?: string; // the quest, for a complete card
  level?: number; // for a level-up card
}

// What changed between two states, as lines: quests offered, taken, finished; a level gained.
export function narrate(before: GameState, after: GameState): Note[] {
  const out: Note[] = [];
  for (const [id, a] of Object.entries(after.quests)) {
    const b = before.quests[id],
      q = Quest.get(id);
    if (!b && a.status === "notTaken")
      out.push({
        kind: "reward",
        text: `${GLYPH[q.kind]} ${q.name} — offered.`,
      });
    else if (b?.status !== "taken" && a.status === "taken")
      out.push({
        kind: "reward",
        text: `${GLYPH[q.kind]} ${q.name}. ${q.objective}`,
      });
    else if (b?.status === "taken" && a.status === "complete") {
      if (q.give.length)
        out.push({
          kind: "reward",
          text: `Received: ${q.give.map((i) => Item.get(i).name).join(", ")}.`,
        });
      if (q.narration) out.push({ kind: "story", text: q.narration });
      const card =
        q.epilogue || q.reward.xp || q.reward.gold || q.reward.items?.length;
      out.push(
        card
          ? {
              kind: "complete",
              id,
              text: `${GLYPH[q.kind]} ${q.name} complete.`,
            }
          : { kind: "reward", text: `${GLYPH[q.kind]} ${q.name} — done.` }
      );
    }
  }
  if (after.player.level > before.player.level)
    out.push({
      kind: "levelup",
      level: after.player.level,
      text: `Level ${after.player.level}.`,
    });
  return out;
}

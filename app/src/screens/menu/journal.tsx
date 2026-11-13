import { useState } from "react";
import { useGame } from "@/state/game";
import { Quest } from "@/data/quests";
import { GLYPH, track, accept, whereOffered } from "@/systems/quests";
import { unmet } from "@/systems/requirements";
import { row, small } from "@/ui/styles";
import Tabs from "@/ui/tabs";
import type { QuestProgress } from "@/state/types";

const GROUPS = ["active", "offered", "done"] as const;
type Group = (typeof GROUPS)[number];

// which section a quest belongs in — null = hidden (its next step now stands for the line)
const section = (
  id: string,
  p: QuestProgress,
  quests: Record<string, QuestProgress>
): Group | null => {
  if (p.status === "notTaken") return "offered";
  if (p.status === "taken") return "active";
  const after = Quest.get(id).next;
  if (!after.length) return "done";
  return after.some((n) => quests[n]) ? null : "active";
};

// Everything you've been told: what you're on, what waits, what's done.
export default function Journal() {
  const { state, update } = useGame();
  const [group, setGroup] = useState<Group>("active");
  const entries = Object.entries(state.quests).filter(
    ([id, p]) => section(id, p, state.quests) === group
  );
  return (
    <>
      <Tabs
        tabs={GROUPS}
        value={group}
        onPick={setGroup}
        gap={16}
        tut="journal"
      />
      {entries.length === 0 && <div style={{ opacity: 0.4 }}>—</div>}
      {entries.map(([id, p]) => {
        const q = Quest.get(id),
          why = unmet(state, q.acceptable);
        return (
          <div key={id} style={{ ...row, opacity: group === "done" ? 0.5 : 1 }}>
            <span>
              {GLYPH[q.kind]} {q.chain ?? q.name}
              {p.status !== "complete" && (
                <div style={{ opacity: 0.6, fontSize: "0.9em" }}>
                  {q.objective}
                </div>
              )}
              {group === "offered" && (
                <div style={{ opacity: 0.6, fontSize: "0.9em" }}>
                  {whereOffered(state, id)}
                </div>
              )}
            </span>
            {p.status === "taken" && (
              <button style={small} onClick={() => update(track(state, id))}>
                {p.tracked ? "Tracked" : "Track"}
              </button>
            )}
            {group === "offered" && (
              <button
                style={{ ...small, opacity: why ? 0.4 : 1 }}
                disabled={!!why}
                title={why ?? ""}
                onClick={() => update(accept(state, id))}
              >
                {why ?? "Accept"}
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}

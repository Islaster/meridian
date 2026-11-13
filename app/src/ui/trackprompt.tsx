import { useEffect, useRef, useState } from "react";
import { useGame } from "@/state/game";
import { track, GLYPH } from "@/systems/quests";
import { Quest } from "@/models/quest";
import { SERIF, LINE } from "./theme";

const SHOW = 7000;

// A quest just went taken while another was followed: offer the switch, for a moment.
export default function TrackPrompt() {
  const { state, update } = useGame();
  const prev = useRef(state.quests);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const anyTracked = Object.values(state.quests).some((q) => q.tracked);
    const fresh = anyTracked
      ? Object.entries(state.quests).find(
          ([k, q]) =>
            q.status === "taken" &&
            !q.tracked &&
            prev.current[k]?.status !== "taken"
        )
      : undefined;
    prev.current = state.quests;
    if (fresh) setId(fresh[0]);
  }, [state.quests]);

  useEffect(() => {
    if (!id) return;
    const t = setTimeout(() => setId(null), SHOW);
    return () => clearTimeout(t);
  }, [id]);

  if (!id) return null;
  const q = Quest.get(id);
  return (
    <div
      style={{
        position: "fixed",
        left: 24,
        top: 24,
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "8px 14px",
        border: `1px solid ${LINE}`,
        background: "#000",
        color: "rgba(233,236,242,0.85)",
        font: `400 15px ${SERIF}`,
      }}
    >
      <span>
        {GLYPH[q.kind]} {q.name}
      </span>
      <button
        style={{
          font: "inherit",
          color: "inherit",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          opacity: 0.7,
        }}
        onClick={() => {
          update(track(state, id));
          setId(null);
        }}
      >
        [ track ]
      </button>
    </div>
  );
}

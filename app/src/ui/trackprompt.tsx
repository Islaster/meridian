import { useEffect, useRef, useState } from "react";
import { useGame } from "../state/gamecontext";
import { track, GLYPH } from "../systems/quests";
import { Quest } from "../models/quest";
import { SERIF } from "./cards";

const SHOW = 7000;

const box = {
  position: "fixed" as const,
  right: 24,
  top: 24,
  display: "flex",
  gap: 14,
  alignItems: "center",
  padding: "8px 14px",
  border: "1px solid rgba(233,236,242,0.28)",
  background: "#000",
  color: "rgba(233,236,242,0.85)",
  font: `400 15px ${SERIF}`,
};

const btn = {
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  opacity: 0.7,
};

export default function TrackPrompt() {
  const { state, changeState } = useGame();
  const prev = useRef(state.quests);
  const [id, setId] = useState<string | null>(null);

  // a quest just went taken without being tracked → offer the switch
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
    <div style={box}>
      <span>
        {GLYPH[q.kind]} {q.name}
      </span>
      <button
        style={btn}
        onClick={() => {
          changeState("quests", track(state, id).quests);
          setId(null);
        }}
      >
        [ track ]
      </button>
    </div>
  );
}

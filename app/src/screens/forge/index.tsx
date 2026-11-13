import { useState } from "react";
import { useGame } from "@/state/game";
import MenuButton from "@/ui/menubutton";
import { greyed, ptr, dim, label, para, sheet } from "@/ui/styles";
import Gauge from "@/ui/gauge";
import {
  recipes,
  missing,
  gradeWindow,
  craft,
  type Make,
} from "@/systems/craft";
import type { Craft } from "@/data/items";

// Four gauges, in order; the hands decide where in the grade window the piece comes out.
type Stage = "choose" | "heat" | "draw" | "quench" | "finish" | "read";
const STAGES: {
  id: Exclude<Stage, "choose" | "read">;
  text: string;
  rounds: number;
  band: number;
  speed: number;
  lines: [string, string];
}[] = [
  {
    id: "heat",
    text: "The bar goes into the coals. Watch the colour; pull it when it's right.",
    rounds: 1,
    band: 6,
    speed: 0.6,
    lines: ["Too cold — it won't move.", "Cherry red. Now."],
  },
  {
    id: "draw",
    text: "Draw it out. Three strokes, each one where the iron wants it.",
    rounds: 3,
    band: 4,
    speed: 0.8,
    lines: ["It rings wrong.", "The iron moves."],
  },
  {
    id: "quench",
    text: "The glow is going. One chance to set it.",
    rounds: 1,
    band: 3,
    speed: 1,
    lines: ["It cracks along the edge.", "A hiss, and it holds."],
  },
  {
    id: "finish",
    text: "To the stone. Two passes, even pressure, and don't chase it.",
    rounds: 2,
    band: 5,
    speed: 0.7,
    lines: ["The edge wanders.", "The edge comes up true."],
  },
];
const VERBS: Record<string, Record<string, string>> = {
  smith: {
    heat: "Pull the bar",
    draw: "Strike",
    quench: "Quench",
    finish: "Grind",
  },
  alchemy: { heat: "Steep", draw: "Stir", quench: "Strain", finish: "Bottle" },
};

export default function Forge({
  craft: which,
  title,
  onClose,
}: {
  craft: Craft;
  title: string;
  onClose: () => void;
}) {
  const { state, update } = useGame();
  const [recipe, setRecipe] = useState<Make | null>(null);
  const [stage, setStage] = useState<Stage>("choose");
  const [hits, setHits] = useState(0);
  const [cracked, setCracked] = useState(false);
  const [said, setSaid] = useState<string[]>([]);
  const seed = state.time.dayId * 7 + (state.counters.forged ?? 0);
  const verbs = VERBS[which] ?? VERBS.smith;
  const current = STAGES.find((s) => s.id === stage);

  const next = (h: number) => {
    const i = STAGES.findIndex((s) => s.id === stage);
    const s = STAGES[i];
    const total = hits + h;
    setHits(total);
    setSaid((l) => [...l, s.lines[h > 0 ? 1 : 0]]);
    if (s.id === "quench") setCracked(h === 0);
    if (i + 1 < STAGES.length) return setStage(STAGES[i + 1].id);
    setStage("read");
    update(craft(state, recipe!, total, !cracked));
  };
  const again = () => {
    setStage("choose");
    setRecipe(null);
    setHits(0);
    setSaid([]);
  };

  return (
    <div style={sheet}>
      <div style={label}>
        {title}
        {recipe && ` · ${recipe.name}`}
      </div>
      {stage === "choose" &&
        recipes(state, which).map((r) => {
          const lack = missing(state, r),
            w = gradeWindow(state, r);
          return (
            <button
              key={r.id}
              style={greyed(lack.length > 0)}
              disabled={lack.length > 0}
              onClick={() => {
                setRecipe(r);
                setStage("heat");
              }}
            >
              {r.name}
              <span style={dim}>
                {" "}
                · {r.needs} ·{" "}
                {w.floor === w.ceiling ? w.floor : `${w.floor} to ${w.ceiling}`}
              </span>
              {lack.length > 0 && (
                <span style={dim}> · short {lack.join(", ")}</span>
              )}
            </button>
          );
        })}
      {current && (
        <>
          <p style={para}>{current.text}</p>
          <Gauge
            key={current.id}
            verb={verbs[current.id]}
            rounds={current.rounds}
            band={current.band}
            speed={current.speed}
            seed={seed + STAGES.indexOf(current)}
            onDone={next}
          />
        </>
      )}
      {stage === "read" && (
        <>
          {said.map((t, i) => (
            <div key={i} style={dim}>
              {t}
            </div>
          ))}
          <p style={para}>
            {cracked
              ? "A thumb down the crack, and nothing said, which is worse."
              : "Turned over twice, and a grunt. It'll hold."}
          </p>
          <button style={ptr} onClick={again}>
            Another
          </button>
        </>
      )}
      <div style={{ marginTop: 16, alignSelf: "center" }}>
        <MenuButton label="Close" onClick={onClose} />
      </div>
    </div>
  );
}

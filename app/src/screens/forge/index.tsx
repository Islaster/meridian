import { useState } from "react";
import { useGame } from "../../state/context";
import { SERIF, MenuButton } from "../../ui/cards";
import { ptr, dim, label, para } from "../../ui/styles";
import Gauge from "../../ui/gauge";
import {
  recipes,
  missing,
  gradeWindow,
  craft,
  type Make,
} from "../../systems/craft";
import { type Craft } from "../../data/items";

type Stage = "choose" | "heat" | "draw" | "quench" | "finish" | "read";

const LINES = {
  heat: ["Too cold — it won't move.", "Cherry red. Now."],
  draw: ["It rings wrong.", "The iron moves."],
  quench: ["It cracks along the edge.", "A hiss, and it holds."],
  finish: ["The edge wanders.", "The edge comes up true."],
};

const VERBS: Record<
  string,
  { heat: string; draw: string; quench: string; finish: string }
> = {
  smith: {
    heat: "Pull the bar",
    draw: "Strike",
    quench: "Quench",
    finish: "Grind",
  },
  alchemy: { heat: "Steep", draw: "Stir", quench: "Strain", finish: "Bottle" },
};

// recipes(state, which) in the choose stage; verb={v.heat} … verb={v.finish} on the four gauges

export default function Forge({
  craft: which,
  onClose,
}: {
  craft: Craft;
  onClose: () => void;
}) {
  const { state, changeState } = useGame();
  const [recipe, setRecipe] = useState<Make | null>(null);
  const [stage, setStage] = useState<Stage>("choose");
  const [hits, setHits] = useState(0);
  const [cracked, setCracked] = useState(false);
  const [said, setSaid] = useState<string[]>([]);
  const seed = state.time.dayId * 7 + (state.counters.forged ?? 0);
  const v = VERBS[which] ?? VERBS.smith;

  const say = (t: string) => setSaid((l) => [...l, t]);
  const apply = (n: typeof state) =>
    (Object.keys(n) as (keyof typeof state)[]).forEach((k) =>
      changeState(k, n[k])
    );

  const finish = () => {
    setStage("read");
    apply(craft(state, recipe!, hits, !cracked));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.96)",
        color: "rgba(233,236,242,0.92)",
        font: `400 clamp(14px, 1.4vw, 18px) ${SERIF}`,
        padding: "48px 24px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={label}>The anvil{recipe && ` · ${recipe.name}`}</div>

        {stage === "choose" &&
          recipes(state, "smith").map((r) => {
            const lack = missing(state, r),
              w = gradeWindow(state, r);
            return (
              <button
                key={r.id}
                style={{ ...ptr, opacity: lack.length ? 0.4 : 1 }}
                disabled={!!lack.length}
                onClick={() => {
                  setRecipe(r);
                  setStage("heat");
                }}
              >
                {r.name}
                <span style={dim}>
                  {" "}
                  · {r.needs} ·{" "}
                  {w.floor === w.ceiling
                    ? w.floor
                    : `${w.floor} to ${w.ceiling}`}
                </span>
                {lack.length > 0 && (
                  <span style={dim}> · short {lack.join(", ")}</span>
                )}
              </button>
            );
          })}

        {stage === "heat" && (
          <>
            <p style={para}>
              The bar goes into the coals. Watch the colour; pull it when it's
              right.
            </p>
            <Gauge
              verb={v.heat}
              rounds={1}
              band={6}
              speed={0.6}
              seed={seed}
              onDone={(h) => {
                setHits(h);
                say(LINES.heat[h]);
                setStage("draw");
              }}
            />
          </>
        )}
        {stage === "draw" && (
          <>
            <p style={para}>
              Draw it out. Three strokes, each one where the iron wants it.
            </p>
            <Gauge
              verb={v.draw}
              rounds={3}
              band={4}
              speed={0.8}
              seed={seed + 1}
              onDone={(h) => {
                setHits((x) => x + h);
                say(LINES.draw[h > 1 ? 1 : 0]);
                setStage("quench");
              }}
            />
          </>
        )}
        {stage === "quench" && (
          <>
            <p style={para}>The glow is going. One chance to set it.</p>
            <Gauge
              verb={v.quench}
              rounds={1}
              band={3}
              speed={1}
              seed={seed + 2}
              onDone={(h) => {
                say(LINES.quench[h]);
                setCracked(h === 0);
                setStage("finish");
              }}
            />
          </>
        )}
        {stage === "finish" && (
          <>
            <p style={para}>
              To the stone. Two passes, even pressure, and don't chase it.
            </p>
            <Gauge
              verb={v.finish}
              rounds={2}
              band={5}
              speed={0.7}
              seed={seed + 3}
              onDone={(h) => {
                say(LINES.finish[h > 0 ? 1 : 0]);
                setHits((x) => x + h);
                finish();
              }}
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
                ? "Tobin runs a thumb down the crack and says nothing, which is worse."
                : "Tobin turns it over twice and grunts. It'll hold."}
            </p>
            <button
              style={ptr}
              onClick={() => {
                setStage("choose");
                setRecipe(null);
                setHits(0);
                setSaid([]);
              }}
            >
              Another
            </button>
          </>
        )}

        <div style={{ marginTop: 16, alignSelf: "center" }}>
          <MenuButton label="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

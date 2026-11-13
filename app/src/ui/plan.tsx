import type { CSSProperties, ReactNode } from "react";
import type { Plan } from "@/models/plan";
import { LINE, LINE_FAINT, INK } from "./theme";
import { faint } from "./styles";

// A plan drawn: the outline, and a box for everything in it. What a box says is
// decided by whoever draws the plan — the world map, a dungeon's rooms — as a Cell.
export interface Cell {
  title: ReactNode;
  note?: ReactNode; // the line under the name: a cost, a reason, "you are here"
  body?: ReactNode; // who's standing in it
  here?: boolean; // you're in it
  dim?: boolean; // shut, or not allowed
  can?: boolean; // clicking it does something
  nested?: boolean; // it has a plan of its own
  out?: boolean; // a way out of this level — drawn so it can't be missed
  hidden?: boolean; // not drawn — a room you haven't found
  tut?: string; // a data-tut key for the tutorial's spotlight
}

export default function PlanView({
  plan,
  cells,
  onPick,
}: {
  plan: Plan;
  cells: Record<string, Cell>;
  onPick: (id: string) => void;
}) {
  const [pw, ph] = plan.size;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${pw} / ${ph}`,
        border: `1px solid ${LINE}`,
        boxSizing: "border-box",
      }}
    >
      {Object.entries(plan.boxes).map(([id, [x, y, w, h]]) => {
        const c = cells[id];
        if (!c || c.hidden) return null;
        return (
          <div
            key={id}
            data-tut={c.tut}
            onClick={() => c.can && onPick(id)}
            style={{
              position: "absolute",
              left: `${(x / pw) * 100}%`,
              top: `${(y / ph) * 100}%`,
              width: `${(w / pw) * 100}%`,
              height: `${(h / ph) * 100}%`,
              boxSizing: "border-box",
              border: `1px ${c.out ? "dashed" : "solid"} ${
                c.here || c.out ? INK : LINE
              }`,
              background: c.here ? "rgba(233,236,242,0.06)" : "transparent",
              opacity: c.dim ? 0.4 : 1,
              cursor: c.can ? "pointer" : "default",
              padding: "4px 7px",
              overflow: "hidden",
              fontSize: "0.85em",
              lineHeight: 1.3,
            }}
          >
            {c.nested && <div style={inset} />}
            {c.out && <div style={tag}>out</div>}
            <div>
              {c.here && "◉ "}
              {c.title}
            </div>
            {c.note && <div style={faint}>{c.note}</div>}
            {c.body && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {c.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// the corner mark on a way out
const tag: CSSProperties = {
  position: "absolute",
  bottom: 3,
  right: 6,
  fontSize: "0.7em",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  opacity: 0.7,
};
// a second line inside the border: this box has a plan of its own
const inset: CSSProperties = {
  position: "absolute",
  inset: 3,
  border: `1px solid ${LINE_FAINT}`,
  pointerEvents: "none",
};

import type { Town } from "./usetown";
import { para, rail } from "../../ui/styles";
import { describeNow } from "../../systems/presence";
import { GLYPH } from "../../systems/quests";
import { Quest } from "../../data/quests";

export default function Scene({ t }: { t: Town }) {
  const { state, loc, line, notes } = t;
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: "inherit",
            fontWeight: 400,
            fontSize: "1.4em",
            letterSpacing: "0.06em",
          }}
        >
          {loc.name}
        </h2>
        <p style={{ ...para, fontSize: "0.95em", opacity: 0.8 }}>
          {describeNow(state, loc)}
        </p>
      </div>
      {loc.notices
        .map((n) => n(state))
        .filter(Boolean)
        .map((x, i) => (
          <p key={i} style={{ ...para, opacity: 0.7 }}>
            {x}
          </p>
        ))}
      {line && <p style={{ ...para, opacity: 0.85 }}>“{line}”</p>}
      {notes
        .filter((n) => n.kind !== "complete")
        .map((n, i) => (
          <p key={i} style={{ ...para, opacity: 0.85, fontStyle: "italic" }}>
            {n.text}
          </p>
        ))}
      {Object.entries(state.quests)
        .filter(([, p]) => p.tracked && p.status === "taken")
        .map(([id]) => {
          const q = Quest.get(id);
          return (
            <div
              key={id}
              data-tut="tracker"
              style={{ ...rail, fontSize: "0.9em" }}
            >
              <span>
                <span data-tut="mark">{GLYPH[q.kind]}</span> {q.name}
              </span>
              <span style={{ opacity: 0.7 }}>{q.objective}</span>
            </div>
          );
        })}
    </>
  );
}

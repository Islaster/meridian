import type { World } from "./useworld";
import { para, rail, heading } from "@/ui/styles";
import { GLYPH } from "@/systems/quests";
import { Quest } from "@/data/quests";
import { Log } from "@/screens/play/frame";

export default function Scene({ w }: { w: World }) {
  const { state, loc, line } = w;
  const tracked = Object.entries(state.quests).find(
    ([, p]) => p.tracked && p.status === "taken"
  );
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h2 style={heading}>{loc.name}</h2>
        <p style={{ ...para, fontSize: "0.95em", opacity: 0.8 }}>
          {loc.describe}
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
      <Log play={w.play} />
      {tracked && (
        <div data-tut="tracker" style={{ ...rail, fontSize: "0.9em" }}>
          <span>
            <span data-tut="mark">{GLYPH[Quest.get(tracked[0]).kind]}</span>{" "}
            {Quest.get(tracked[0]).name}
          </span>
          <span style={{ opacity: 0.7 }}>
            {Quest.get(tracked[0]).objective}
          </span>
        </div>
      )}
    </>
  );
}

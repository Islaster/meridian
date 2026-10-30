import type { Town } from "./usetown";
import { xpToNext } from "../../systems/progression";
import { clock } from "../../systems/time";

export default function Header({ t }: { t: Town }) {
  const { player: p, time } = t.state;
  const pct = Math.min(100, (p.xp / xpToNext(p.level)) * 100);
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            letterSpacing: "0.08em",
          }}
        >
          <span>{p.name}</span>
          <span style={{ opacity: 0.6 }}>Level {p.level}</span>
        </div>
        <div style={{ height: 2, background: "rgba(233,236,242,0.12)" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: "rgba(233,236,242,0.55)",
              transition: "width 600ms ease",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "0.75em",
            opacity: 0.4,
            letterSpacing: "0.1em",
            textAlign: "right",
          }}
        >
          {p.xp} / {xpToNext(p.level)} xp
        </div>
      </div>
      <div style={{ opacity: 0.55, letterSpacing: "0.1em" }}>
        Day {time.dayId} · {time.day} · {clock(time.hour)} · {time.block}
      </div>
    </>
  );
}

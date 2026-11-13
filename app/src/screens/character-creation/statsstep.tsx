import { useState } from "react";
import MenuButton from "@/ui/menubutton";
import { stage, small } from "@/ui/styles";
import { FONT_CARD } from "@/ui/theme";

type Stats = Record<string, number>;
const DESC: Record<string, string> = {
  str: "Carries more, hits harder.",
  end: "Health, and what armor can bear.",
  agi: "Acts sooner. Escapes.",
  dex: "Lands the hit. Finds the crit.",
  int: "Reads signs. Fuels the arcane.",
  wis: "Resists charm and confusion.",
  lck: "What the deep decides to give you.",
  cha: "How doors, and people, open to you.",
};
const btn = { ...small, width: 32, height: 32, padding: 0 };

// Ten points over the base sheet; masters will read it.
export default function StatsStep({
  base,
  pool = 10,
  onDone,
}: {
  base: Stats;
  pool?: number;
  onDone: (stats: Stats) => void;
}) {
  const [stats, setStats] = useState<Stats>({ ...base });
  const left =
    pool - Object.keys(stats).reduce((s, k) => s + (stats[k] - base[k]), 0);
  const adjust = (k: string, d: number) =>
    setStats((s) => ({ ...s, [k]: s[k] + d }));
  return (
    <div style={{ ...stage, font: FONT_CARD, gap: 14 }}>
      <p style={{ margin: "0 0 12px", letterSpacing: "0.1em" }}>
        Points to spend: {left}
      </p>
      {Object.keys(stats).map((k) => (
        <div
          key={k}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            width: "min(640px, 90vw)",
          }}
        >
          <span style={{ width: 48, letterSpacing: "0.15em" }}>
            {k.toUpperCase()}
          </span>
          <span style={{ flex: 1, opacity: 0.65 }}>{DESC[k] ?? ""}</span>
          <button
            style={btn}
            disabled={stats[k] <= base[k]}
            onClick={() => adjust(k, -1)}
          >
            −
          </button>
          <span style={{ width: 28, textAlign: "center" }}>{stats[k]}</span>
          <button style={btn} disabled={left <= 0} onClick={() => adjust(k, 1)}>
            +
          </button>
        </div>
      ))}
      <p style={{ margin: "12px 0 0", opacity: 0.55 }}>
        Masters will read this sheet.
      </p>
      {left === 0 && (
        <MenuButton label="Continue" onClick={() => onDone(stats)} />
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { ptr, dim, label } from "./styles";

const SEG = 20;

// A bar fills and empties; a band sits somewhere on it. Press the verb while the fill is in the band.
// The band's place per round comes off the seed, so a replayed day sets the same test.
export default function Gauge({
  verb,
  rounds,
  band,
  speed,
  seed,
  onDone,
}: {
  verb: string;
  rounds: number;
  band: number; // width in segments — wider is easier
  speed: number; // segments per tick — faster is harder
  seed: number;
  onDone: (hits: number) => void;
}) {
  const [fill, setFill] = useState(0);
  const [round, setRound] = useState(0);
  const [hits, setHits] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const dir = useRef(1);

  const start = ((seed * 9301 + round * 49297) % 233280) / 233280;
  const lo = Math.floor(start * (SEG - band)),
    hi = lo + band;

  useEffect(() => {
    const id = window.setInterval(() => {
      setFill((f) => {
        const n = f + dir.current * speed;
        if (n >= SEG) dir.current = -1;
        if (n <= 0) dir.current = 1;
        return Math.max(0, Math.min(SEG, n));
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [speed]);

  const strike = () => {
    const hit = fill >= lo && fill <= hi;
    const h = hits + (hit ? 1 : 0),
      r = round + 1;
    setHits(h);
    setLog((l) => [...l, hit ? `${verb} — true.` : `${verb} — off.`]);
    if (r >= rounds) return onDone(h);
    setRound(r);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={label}>
        {round + 1} of {rounds} · {hits} true
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: SEG }, (_, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 10,
              background:
                i < Math.ceil(fill)
                  ? "rgba(233,236,242,0.85)"
                  : "rgba(233,236,242,0.12)",
              outline:
                i >= lo && i < hi ? "1px solid rgba(255,255,255,0.9)" : "none",
            }}
          />
        ))}
      </div>
      <button style={ptr} onClick={strike}>
        {verb}
      </button>
      {log.map((t, i) => (
        <div key={i} style={dim}>
          {t}
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import Typewriter from "./typewriter";

interface Props {
  lines: string[];
  complete?: boolean;
  onDone?: () => void;
}

export default function Passage({ lines, complete = false, onDone }: Props) {
  const [n, setN] = useState(0); // lines fully typed so far
  useEffect(() => {
    setN(0);
  }, [lines]);
  useEffect(() => {
    if (complete || n >= lines.length) onDone?.();
  }, [n, lines, complete, onDone]);

  const shown = complete ? lines.length : Math.min(n + 1, lines.length);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        maxWidth: 560,
        textAlign: "left",
      }}
    >
      {lines.slice(0, shown).map((line, i) => {
        return (
          <p key={i} style={{ margin: 0, lineHeight: 1.6 }}>
            {complete || i < n ? (
              line
            ) : (
              <Typewriter text={line} onDone={() => setN(n + 1)} />
            )}
          </p>
        );
      })}
    </div>
  );
}

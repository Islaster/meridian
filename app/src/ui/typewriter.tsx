import { useEffect, useState, type CSSProperties } from "react";

interface Props {
  text: string;
  cps?: number;
  complete?: boolean;
  onDone?: () => void;
  style?: CSSProperties;
}

// One line, typed. New text is a new component: key it.
export default function Typewriter({
  text,
  cps = 40,
  complete = false,
  onDone,
  style,
}: Props) {
  const [n, setN] = useState(0);
  const shown = complete ? text.length : n;
  useEffect(() => {
    if (complete || n >= text.length) return;
    const pause = ".,;:!?".includes(text[n - 1] ?? "") ? 8 : 1; // breathe at punctuation
    const id = window.setTimeout(() => setN(n + 1), (1000 / cps) * pause);
    return () => window.clearTimeout(id);
  }, [n, text, cps, complete]);
  useEffect(() => {
    if (shown >= text.length) onDone?.();
  }, [shown, text, onDone]);
  return <span style={style}>{text.slice(0, shown)}</span>;
}

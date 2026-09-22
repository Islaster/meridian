import { useEffect, useState, type CSSProperties } from "react";

interface Props {
  text: string;
  cps?: number;
  complete?: boolean;
  onDone?: () => void;
  style?: CSSProperties;
}

export default function Typewriter({
  text,
  cps = 40,
  complete = false,
  onDone,
  style,
}: Props) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
  }, [text]);
  useEffect(() => {
    if (complete) {
      setN(text.length);
      return;
    }
    if (n >= text.length) return;
    const pause = ".,;:!?".includes(text[n - 1] ?? "") ? 8 : 1; // breathe at punctuation
    const id = window.setTimeout(() => setN(n + 1), (1000 / cps) * pause);
    return () => window.clearTimeout(id);
  }, [n, text, cps, complete]);
  useEffect(() => {
    if (n >= text.length) onDone?.();
  }, [n, text, onDone]);
  return <span style={style}>{text.slice(0, n)}</span>;
}

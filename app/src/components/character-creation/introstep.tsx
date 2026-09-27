import { useEffect, useState, type KeyboardEvent } from "react";
import Passage from "../shared/passage";
import SkipButton from "../shared/skipbutton";
import { SERIF, MenuButton } from "../landing/cards";
import LedgerLine from "../shared/ledgerline";

const BLURB = [
  "The letter found you on the coast road. A relative you never met has died, and left you what little remained: a shuttered workshop, a roof, and a name on the deed that was not yours.",
  "Everyone has a Ledger, and always has: a line of pale writing at the edge of sight, that no one wrote, that records. Masters read it before they teach. The Guild built its charters on it. It has never answered a question. It has never been wrong.",
  "It writes a name the first time a person binds themselves to something — a master, a crew, a promise kept past the point of convenience. Most bind young. You never have.",
  "Now there is a dead man's shop, and the question of whether you will take it up. Your Ledger has opened a line for the answer.",
];

export default function IntroStep({
  onNamed,
}: {
  onNamed: (name: string) => void;
}) {
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [name, setName] = useState("");
  const record = () => {
    if (name.trim()) setRecorded(true);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") record();
  };
  useEffect(() => {
    if (!recorded) return;
    const id = window.setTimeout(() => onNamed(name.trim()), 1500);
    return () => window.clearTimeout(id);
  }, [recorded]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#000",
        color: "rgba(233,236,242,0.92)",
        font: `400 clamp(16px, 1.8vw, 22px) ${SERIF}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <Passage lines={BLURB} complete={skip} onDone={() => setDone(true)} />
      {done && !recorded && (
        <>
          <LedgerLine>
            《Name》&nbsp;
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={onKey}
              autoFocus
              style={{
                font: "inherit",
                color: "inherit",
                letterSpacing: "inherit",
                background: "transparent",
                border: "none",
                outline: "none",
                width: 200,
                padding: 0,
              }}
            />
          </LedgerLine>
          <MenuButton label="Continue" onClick={record} />
        </>
      )}
      {recorded && <LedgerLine>《Recorded》 {name.trim()}</LedgerLine>}
      {!done && <SkipButton onClick={() => setSkip(true)} />}
    </div>
  );
}

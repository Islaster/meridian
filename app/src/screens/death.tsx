import { useState } from "react";
import Passage from "../ui/passage";
import { SERIF, MenuButton } from "../ui/cards";
import LedgerLine from "../ui/ledgerline";

const LINES = [
  "The world goes out.",
  "There is no dark, and no time in it. Then a ceiling: the bed upstairs that was someone else's. Morning light through the shutters, the same as it was.",
  "Whatever you did today, no one remembers it. Only you.",
];

export default function Death({ onContinue }: { onContinue: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "rgba(233,236,242,0.92)",
        font: `400 clamp(16px, 1.8vw, 22px) ${SERIF}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: 24,
        zIndex: 60,
      }}
    >
      <Passage lines={LINES} onDone={() => setDone(true)} />
      {done && <LedgerLine>《Day》 lost</LedgerLine>}
      {done && <MenuButton label="Wake" onClick={onContinue} />}
    </div>
  );
}

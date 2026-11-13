import { useState } from "react";
import Passage from "@/ui/passage";
import MenuButton from "@/ui/menubutton";
import LedgerLine from "@/ui/ledgerline";
import { stage } from "@/ui/styles";
import { FONT_READ } from "@/ui/theme";

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
        ...stage,
        position: "fixed",
        inset: 0,
        font: FONT_READ,
        zIndex: 60,
      }}
    >
      <Passage lines={LINES} onDone={() => setDone(true)} />
      {done && <LedgerLine>《Day》 lost</LedgerLine>}
      {done && <MenuButton label="Wake" onClick={onContinue} />}
    </div>
  );
}

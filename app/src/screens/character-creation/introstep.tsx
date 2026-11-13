import { useEffect, useState, type KeyboardEvent } from "react";
import Passage from "@/ui/passage";
import SkipButton from "@/ui/skipbutton";
import MenuButton from "@/ui/menubutton";
import LedgerLine from "@/ui/ledgerline";
import { stage, para } from "@/ui/styles";
import { FONT_READ } from "@/ui/theme";

const BLURB = [
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
  const [name, setName] = useState("");
  const [step, setStep] = useState<"ask" | "confirm" | "recorded">("ask");

  const record = () => name.trim() && setStep("confirm");
  const onKey = (e: KeyboardEvent<HTMLInputElement>) =>
    e.key === "Enter" && record();
  useEffect(() => {
    if (step !== "recorded") return;
    const id = window.setTimeout(() => onNamed(name.trim()), 1500);
    return () => window.clearTimeout(id);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ ...stage, font: FONT_READ }}>
      <Passage lines={BLURB} complete={skip} onDone={() => setDone(true)} />
      {done && step === "ask" && (
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
      {step === "confirm" && (
        <>
          <LedgerLine>《Name》 {name.trim()}</LedgerLine>
          <p
            style={{
              ...para,
              maxWidth: 560,
              textAlign: "center",
              opacity: 0.85,
            }}
          >
            A name, once recorded, is not unwritten. Is this the one you will
            answer to?
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            <MenuButton label="It is" onClick={() => setStep("recorded")} />
            <MenuButton label="Not yet" onClick={() => setStep("ask")} />
          </div>
        </>
      )}
      {step === "recorded" && (
        <LedgerLine>《Recorded》 {name.trim()}</LedgerLine>
      )}
      {!done && <SkipButton onClick={() => setSkip(true)} />}
    </div>
  );
}

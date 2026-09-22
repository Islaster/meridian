import React, { useState } from "react";
import Typewriter from "../shared/typewriter";
import SkipButton from "../shared/skipbutton";
import { SERIF, MenuButton } from "../landing/cards";

const BLURB =
  "The letter found you on the coast road. A relative you never met has died, and left you what little remained: a shuttered workshop, a roof, and a name on the deed that was not yours. The town does not ask where you came from. It asks what to call you.";

export default function IntroStep({
  onNamed,
}: {
  onNamed: (name: string) => void;
}) {
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);
  const [name, setName] = useState("");
  const handleEnterKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("keydown fired:", event.key);
    if (event.key === "Enter") {
      console.log("Enter branch, name:", JSON.stringify(name));
      if (name.trim()) onNamed(name.trim());
    }
  };
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
      }}
    >
      <p
        style={{
          maxWidth: 560,
          lineHeight: 1.6,
          textAlign: "center",
          margin: 0,
        }}
      >
        <Typewriter text={BLURB} complete={skip} onDone={() => setDone(true)} />
      </p>
      {done && (
        <>
          <p style={{ margin: 0 }}>What did they call you?</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => handleEnterKey(e)}
            autoFocus
            style={{
              font: "inherit",
              textAlign: "center",
              letterSpacing: "0.1em",
              color: "inherit",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid rgba(233,236,242,0.35)",
              padding: "6px 12px",
              outline: "none",
              width: 280,
            }}
          />
          <MenuButton
            label="Continue"
            onClick={() => {
              if (name.trim()) onNamed(name.trim());
            }}
          />
        </>
      )}
      {!done && <SkipButton onClick={() => setSkip(true)} />}
    </div>
  );
}

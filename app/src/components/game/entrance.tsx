import { useState } from "react";
import Passage from "../shared/passage";
import SkipButton from "../shared/skipbutton";
import { SERIF, MenuButton } from "../landing/cards";
import { useGame } from "../../state/gamecontext";

const BEATS: string[][] = [
  [
    "Caldermouth.",
    "The letter said the town was smaller than it had been. The road agrees: half the breakwater is gone, and the gate towers lean.",
    "Below, a harbor that was a town once. Above, the Kiln, quiet.",
  ],
  [
    "The guard stops you with a look, not a hand.",
    "You show him the letter. He reads the name twice.",
    "\"Hale. Osric's dead a month — didn't know he had kin.\" He looks at the key on the letter's ring, then back at you.",
  ],
  [
    '"Harbor row. Down the hill, left at the square, the shop with the shutters closed. Nobody\'s been in since."',
    "He steps aside.",
    "\"Guild's open at eight, if you're the kind that reads the fine print.\"",
  ],
];

export default function Entrance({ onDone }: { onDone: () => void }) {
  const { state, changeState } = useGame();
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);
  const last = i === BEATS.length - 1;
  const next = () => {
    setI(i + 1);
    setDone(false);
    setSkip(false);
  };
  const enter = () => {
    changeState("world", { ...state.world, area: "town-gate" });
    onDone();
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
      <Passage
        key={i}
        lines={BEATS[i]}
        complete={skip}
        onDone={() => setDone(true)}
      />

      {done ? (
        <MenuButton
          label={last ? "Enter the gate" : "Continue"}
          onClick={last ? enter : next}
        />
      ) : (
        <SkipButton onClick={() => setSkip(true)} />
      )}
    </div>
  );
}

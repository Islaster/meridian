import { useState } from "react";
import Passage from "@/ui/passage";
import SkipButton from "@/ui/skipbutton";
import MenuButton from "@/ui/menubutton";
import { useGame } from "@/state/game";
import { giveItem, equip } from "@/systems/inventory";
import { stage } from "@/ui/styles";
import { FONT_READ } from "@/ui/theme";

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
// a LCK 15 start: the guard hands over Hale's blade before Fenn's men collect it
const LUCK_BEAT = [
  "His eyes go to your empty hands, then to a rack of oilcloth bundles behind him.",
  '"Confiscated. Guild rule — no steel past the square for a debtor. Osric\'s is the one on the end." He weighs something. "Fenn\'s men come for the lot at noon. Been on that rack a month."',
  'He lifts it down and puts it in your hands. "Rule says nothing about kin. And I\'d sooner it went to you than to him."',
  "Hale's blade. Yours, on the strength of arriving an hour before it was gone.",
];

export default function Entrance({ onDone }: { onDone: () => void }) {
  const { state, update, commit } = useGame();
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);
  const beats =
    state.player.stats.lck === 15
      ? [BEATS[0], BEATS[1], LUCK_BEAT, BEATS[2]]
      : BEATS;
  const last = i === beats.length - 1;
  const next = () => {
    setI(i + 1);
    setDone(false);
    setSkip(false);
  };
  const enter = () => {
    update({ ...state, world: { ...state.world, area: "town-gate" } });
    commit();
    onDone();
  };
  return (
    <div style={{ ...stage, font: FONT_READ }}>
      <Passage
        key={i}
        lines={beats[i]}
        complete={skip}
        onDone={() => {
          setDone(true);
          if (beats[i] === LUCK_BEAT && !state.bag.items["hales-blade"])
            update({
              ...state,
              bag: giveItem(state.bag, "hales-blade"),
              player: equip(state.player, "hales-blade"),
            });
        }}
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

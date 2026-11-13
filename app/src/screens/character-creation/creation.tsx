import { useState } from "react";
import { useGame } from "@/state/game";
import { basePlayer } from "@/state/newgame";
import IntroStep from "./introstep";
import StatsStep from "./statsstep";

// A name, then a sheet; the player starts from the base with both written in.
export default function Creation({ onDone }: { onDone: () => void }) {
  const { state, update } = useGame();
  const [name, setName] = useState<string | null>(null);
  if (name === null) return <IntroStep onNamed={setName} />;
  return (
    <StatsStep
      base={basePlayer.stats}
      onDone={(stats) => {
        update({ ...state, player: { ...basePlayer, name, stats } });
        onDone();
      }}
    />
  );
}

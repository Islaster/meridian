import { useState } from "react";
import { useGame } from "../../state/gamecontext";
import { player as basePlayer } from "../../state/newGameState";
import IntroStep from "./introstep";
import StatsStep from "./statsstep";

export default function Creation({ onDone }: { onDone: () => void }) {
  const { changeState } = useGame();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const finish = (stats: Record<string, number>) => {
    changeState("player", { ...basePlayer, name, stats });
    onDone();
  };
  if (step === 0)
    return (
      <IntroStep
        onNamed={(n) => {
          setName(n);
          setStep(1);
        }}
      />
    );
  return <StatsStep base={basePlayer.stats} onDone={finish} />;
}

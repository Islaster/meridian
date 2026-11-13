import { useState } from "react";
import Opening from "@/screens/opening/opening";
import { openingPlates } from "@/screens/opening/openingplates";
import MainMenu from "@/screens/main-menu";
import Creation from "@/screens/character-creation/creation";
import Entrance from "@/screens/entrance";
import WorldScreen from "@/screens/world";
import DungeonScreen from "@/screens/dungeon";
import { useGame } from "@/state/game";

type Screen = "title" | "creation" | "entrance" | "game";

// The screens in order; once in the game, where you stand decides which scene renders.
export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const { state } = useGame();
  if (screen === "title")
    return (
      <Opening plates={openingPlates} pixelScale={4}>
        <MainMenu onNewGame={() => setScreen("creation")} />
      </Opening>
    );
  if (screen === "creation")
    return <Creation onDone={() => setScreen("entrance")} />;
  if (screen === "entrance")
    return <Entrance onDone={() => setScreen("game")} />;
  return state.world.dungeon ? <DungeonScreen /> : <WorldScreen />;
}

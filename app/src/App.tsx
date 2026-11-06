import Opening from "./screens/opening/opening";
import { useState } from "react";
import { openingPlates } from "./screens/opening/openingplates";
import MainMenu from "./screens/main-menu";
import Creation from "./screens/character-creation/creation";
import Entrance from "./screens/entrance";
import Town from "./screens/world";
import DungeonScreen from "./screens/dungeon";
import { useGame } from "./state/gamecontext";

function App() {
  const [screen, setScreen] = useState<"" | "start" | "entrance" | "game">("");
  const { state } = useGame();
  return (
    <>
      {screen === "" && (
        <Opening plates={openingPlates} pixelScale={4}>
          <MainMenu onNewGame={() => setScreen("start")} />
        </Opening>
      )}
      {screen === "start" && <Creation onDone={() => setScreen("entrance")} />}
      {screen === "entrance" && <Entrance onDone={() => setScreen("game")} />}
      {screen === "game" &&
        (state.world.dungeon ? <DungeonScreen /> : <Town />)}
    </>
  );
}

export default App;

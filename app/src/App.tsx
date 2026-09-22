import Opening from "./components/landing/opening";
import { useState } from "react";
import { openingPlates } from "./components/landing/openingplates";
import MainMenu from "./components/main-menu/mainmenu";
import Creation from "./components/character-creation/creation";
import Entrance from "./components/game/entrance";
import Town from "./components/game/town";

function App() {
  const [screen, setScreen] = useState("");
  return (
    <>
      {screen === "" && (
        <Opening plates={openingPlates} pixelScale={4}>
          <MainMenu
            onNewGame={() => setScreen("start")}
            onLoadGame={() => setScreen("load")}
            onContinue={() => setScreen("continue")}
            onSettings={() => setScreen("settings")}
          />
        </Opening>
      )}
      {screen === "start" && <Creation onDone={() => setScreen("entrance")} />}
      {screen === "entrance" && <Entrance onDone={() => setScreen("game")} />}
      {screen == "game" && <Town />}
    </>
  );
}

export default App;

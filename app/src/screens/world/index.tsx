import { useTown } from "./usetown";
import { wrap } from "../../ui/styles";
import Header from "./header";
import Scene from "./scene";
import Exits from "./exits";
import Pointers from "./pointers";
import Footer from "./footer";
import Overlays from "./overlays";
import Battle from "../battle";
import Death from "../death";

export default function Town() {
  const t = useTown();
  if (t.dead)
    return (
      <Death
        onContinue={() => {
          t.setDead(false);
          t.rollback();
        }}
      />
    );
  if (t.fight)
    return (
      <Battle
        monsters={t.fight.fight!}
        onWin={t.won}
        onFlee={() => t.setFight(null)}
        onDeath={() => t.setDead(true)}
      />
    );
  return (
    <div style={wrap}>
      <Header t={t} />
      <Scene t={t} />
      <Exits t={t} />
      <Pointers t={t} />
      <Footer t={t} />
      <Overlays t={t} />
    </div>
  );
}

import type { ReactNode } from "react";
import type { Play } from "./useplay";
import { wrap, para } from "@/ui/styles";
import Battle from "@/screens/battle";
import Death from "@/screens/death";
import PlayerMenu from "@/screens/menu/playermenu";
import QuestComplete from "@/screens/play/questcomplete";
import LevelUp from "@/screens/play/levelup";

// What every scene shares: death and battle take the whole screen; otherwise the scene,
// the menu over it, and the cards a quest or a level opens.
export default function Frame({
  play,
  children,
}: {
  play: Play;
  children: ReactNode;
}) {
  if (play.dead)
    return (
      <Death
        onContinue={() => {
          play.setDead(false);
          play.rollback();
        }}
      />
    );
  if (play.fight)
    return (
      <Battle
        monsters={play.fight.monsters}
        onWin={play.won}
        onFlee={play.fled}
        onDeath={() => play.setDead(true)}
      />
    );
  const done = play.notes.find((n) => n.kind === "complete");
  const up = play.notes.find((n) => n.kind === "levelup");
  return (
    <div style={wrap}>
      {children}
      {play.menu && (
        <PlayerMenu initialTab={play.menu} onClose={() => play.setMenu(null)} />
      )}
      {done?.id && (
        <QuestComplete id={done.id} onClose={() => play.clear("complete")} />
      )}
      {up?.level && !done && (
        <LevelUp
          level={up.level}
          onAllocate={() => {
            play.clear("levelup");
            play.setMenu("character");
          }}
          onLater={() => play.clear("levelup")}
        />
      )}
    </div>
  );
}

// the scene's log: what just happened, in order
export const Log = ({ play }: { play: Play }) => (
  <>
    {play.notes
      .filter((n) => n.kind !== "complete")
      .map((n, i) => (
        <p key={i} style={{ ...para, opacity: 0.85, fontStyle: "italic" }}>
          {n.text}
        </p>
      ))}
  </>
);

import type { Town } from "./usetown";
import PlayerMenu from "../menu/playerMenu";
import ShopPanel from "../shop";
import GuildBoard from "../board";
import QuestOffer from "../menu/questoffers";
import QuestComplete from "./questcomplete";
import LevelUp from "../menu/levelUp";
import { para, ptr } from "../../ui/styles";
import Coachmark from "../../ui/coachmark";
import Forge from "../forge";

export default function Overlays({ t }: { t: Town }) {
  const {
    notes,
    loc,
    setNotes,
    confirm,
    setConfirm,
    tutorial,
    dismissTutorial,
    bench,
    setBench,
  } = t;
  const done = notes.find((n) => n.kind === "complete");
  const up = notes.find((n) => n.kind === "levelup");

  return (
    <>
      {t.menu && (
        <PlayerMenu initialTab={t.menu} onClose={() => t.setMenu(null)} />
      )}
      {t.shop && loc.shop && (
        <ShopPanel shop={loc.shop} onClose={() => t.setShop(false)} />
      )}
      {t.board && (
        <GuildBoard onClose={() => t.setBoard(false)} onPick={t.pickPosting} />
      )}
      {t.prompt && !done && (
        <QuestOffer id={t.prompt} onClose={() => t.setPrompt(null)} />
      )}
      {bench && loc.bench && (
        <Forge
          craft={loc.bench.craft}
          title={loc.bench.label}
          onClose={() => setBench(false)}
        />
      )}
      {done?.id && (
        <QuestComplete
          id={done.id}
          onClose={() => setNotes(notes.filter((n) => n.kind !== "complete"))}
        />
      )}
      {up?.level && !done && (
        <LevelUp
          level={up.level}
          onAllocate={() => {
            t.clearLevelUp();
            t.setMenu("character");
          }}
          onLater={t.clearLevelUp}
        />
      )}
      {confirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 520,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <p style={para}>{confirm.text}</p>
            <button style={ptr} onClick={confirm.go}>
              Swear anyway
            </button>
            <button style={ptr} onClick={() => setConfirm(null)}>
              Not now
            </button>
          </div>
        </div>
      )}
      {tutorial && (
        <Coachmark
          title={tutorial.tutorial.title}
          text={tutorial.step.text}
          target={tutorial.step.target}
          showText
          onDone={dismissTutorial}
        />
      )}
    </>
  );
}

import { useState } from "react";
import { useGame } from "../../../state/gamecontext";
import { lend } from "../../../systems/inventory";
import { Location, Npc, type Loadout } from "../../../data/locations";
import { advance, sleep, isOpen } from "../../../systems/time";
import { SERIF } from "../../landing/cards";
import { progress, signals, start, GLYPH } from "../../../systems/quests";
import type { GameState } from "../../../state/types";
import { hasItem } from "../../../systems/inventory";
import { narrate } from "../../../systems/quests";
import { Quest } from "../../../data/quests";
import { Weapon, Item } from "../../../data/items";
import { type Note } from "../../../systems/types";
import QuestComplete from "./questcomplete";
import PlayerMenu from "../menu/playerMenu";
import LevelUp from "../menu/levelUp";
import { xpToNext } from "../../../systems/progression";

const wrap = {
  minHeight: "100vh",
  background: "#000",
  color: "rgba(233,236,242,0.92)",
  font: `400 clamp(15px, 1.5vw, 19px) ${SERIF}`,
  padding: "48px 24px",
  maxWidth: 720,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column" as const,
  gap: 18,
};
const ptr = {
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: "1px solid rgba(233,236,242,0.28)",
  padding: "8px 16px",
  cursor: "pointer",
  textAlign: "left" as const,
};

export default function Town() {
  const { state, changeState } = useGame();
  const loc = Location.get(state.world.area);
  const [line, setLine] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [offer, setOffer] = useState<Loadout[] | null>(null);
  const [menu, setMenu] = useState<null | "inventory" | "character" | "skills">(
    null
  );
  const clearLevelUp = () =>
    setNotes(notes.filter((n) => n.kind !== "levelup"));

  const sig = signals(state);
  console.log("render done:", state.done);
  const apply = (n: GameState) => {
    changeState("world", n.world);
    changeState("time", n.time);
    changeState("bag", n.bag);
    changeState("player", n.player);
    changeState("quests", n.quests);
    changeState("done", n.done);
  };
  const go = (to: string, hours: number) => {
    setLine(null);
    const moved = {
      ...state,
      world: { ...state.world, area: to },
      time: hours ? advance(state.time, hours) : state.time,
    };
    const next = progress(moved, { kind: "visit", location: to });
    setNotes(narrate(state, next));
    apply(next);
  };
  const talk = (id: string) => {
    const n = Npc.get(id);
    console.log(
      "talk:",
      n.id,
      "lends:",
      n.lends,
      "sells:",
      n.sells,
      "done:",
      state.done
    );
    setLine(n.line);
    if (n.lends && !state.done.includes(`loan:${n.id}`)) setOffer(n.lends);
    let next = progress(state, { kind: "talk", npc: id });
    if (n.offers) next = progress(start(next, n.offers), null);
    setNotes(narrate(state, next));
    apply(next);
  };
  const take = (lo: Loadout) => {
    console.log(
      "take:",
      lo.id,
      "weapon?",
      lo.items.map((i) => Item.get(i.id) instanceof Weapon),
      "hand before:",
      state.player.equipment?.mainWeapon
    );
    const npc = loc.npcs
      .map((id) => Npc.get(id))
      .find((n) => n.lends === offer)!;
    let next = lend(state, lo);
    next = { ...next, done: [...next.done, `loan:${npc.id}`] };
    const after = progress(next, null);
    console.log("done after:", after.done);
    try {
      setOffer(null);
      setNotes([
        {
          kind: "reward",
          text: `Took ${lo.name.toLowerCase()}. Equipped: ${
            next.player.equipment?.mainWeapon
          }.`,
        },
        ...narrate(state, after),
      ]);
      console.log("applying");
      apply(after);
    } catch (err) {
      console.error("take failed:", err);
    }
    apply(after);
  };
  const marks = (set?: Set<"main" | "side" | "bounty">) =>
    set?.size ? " " + [...set].map((k) => GLYPH[k]).join(" ") : "";

  return (
    <div style={wrap}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            letterSpacing: "0.08em",
          }}
        >
          <span>{state.player.name}</span>
          <span style={{ opacity: 0.6 }}>Level {state.player.level}</span>
        </div>
        <div style={{ height: 2, background: "rgba(233,236,242,0.12)" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(
                100,
                (state.player.xp / xpToNext(state.player.level)) * 100
              )}%`,
              background: "rgba(233,236,242,0.55)",
              transition: "width 600ms ease",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "0.75em",
            opacity: 0.4,
            letterSpacing: "0.1em",
            textAlign: "right",
          }}
        >
          {state.player.xp} / {xpToNext(state.player.level)} xp
        </div>
      </div>
      <div style={{ opacity: 0.55, letterSpacing: "0.1em" }}>
        Day {state.time.dayId} · {state.time.day} · {state.time.hour}:00 ·{" "}
        {state.time.block}
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: "inherit",
          fontWeight: 400,
          fontSize: "1.4em",
          letterSpacing: "0.06em",
          textTransform: "capitalize",
          color: "rgba(233,236,242,0.92)",
        }}
      >
        {loc.name}
      </h2>

      <p style={{ margin: 0, lineHeight: 1.6 }}>{loc.describe}</p>
      {line && (
        <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.85 }}>“{line}”</p>
      )}
      {notes
        .filter((n) => n.kind !== "complete")
        .map((n, i) => (
          <p
            key={i}
            style={{
              margin: 0,
              lineHeight: 1.6,
              opacity: 0.85,
              fontStyle: "italic",
            }}
          >
            {n.text}
          </p>
        ))}
      {Object.entries(state.quests).map(([id, i]) => {
        const q = Quest.get(id);
        return (
          <div key={id} style={{ opacity: 0.6, fontSize: "0.9em" }}>
            {GLYPH[q.kind]} {q.name} — {q.stages[i].objective}
            {(() => {
              const c = notes.find((n) => n.kind === "complete");
              return c?.id ? (
                <QuestComplete
                  id={c.id}
                  onClose={() =>
                    setNotes(notes.filter((n) => n.kind !== "complete"))
                  }
                />
              ) : null;
            })()}
          </div>
        );
      })}
      {loc.exits.map((e) => {
        const dest = Location.get(e.to);
        const closed = !isOpen(dest.hours, state.time);
        const locked = !!dest.requires && !hasItem(state.bag, dest.requires);
        const why = closed
          ? `closed until ${dest.hours!.open}:00`
          : locked
          ? "the door wants a key"
          : e.hours
          ? `${e.hours}h`
          : "";
        return (
          <button
            key={e.to}
            style={{ ...ptr, opacity: closed || locked ? 0.4 : 1 }}
            disabled={closed || locked}
            onClick={() => go(e.to, e.hours)}
          >
            → {dest.name}
            {marks(sig.exits[e.to])}
            {why && <span style={{ opacity: 0.6 }}> · {why}</span>}
          </button>
        );
      })}
      {loc.npcs.map((id) => {
        const n = Npc.get(id);
        return (
          <button key={id} style={ptr} onClick={() => talk(id)}>
            Talk to {n.name}
            {marks(sig.npcs[id])}
          </button>
        );
      })}
      {offer?.map((lo) => (
        <button key={lo.id} style={ptr} onClick={() => take(lo)}>
          {lo.name}
          <span style={{ opacity: 0.6 }}> · {lo.blurb}</span>
        </button>
      ))}
      <button
        style={ptr}
        onClick={() => changeState("time", advance(state.time, 1))}
      >
        Wait an hour
      </button>
      {loc.canRest && (
        <button
          style={ptr}
          onClick={() => changeState("time", sleep(state.time))}
        >
          Sleep until morning
        </button>
      )}
      <div style={{ opacity: 0.45 }}>✦ main · ◇ side · ⚔ bounty</div>
      <span
        style={{ cursor: "pointer", marginLeft: 16 }}
        onClick={() => setMenu("inventory")}
      >
        [ menu ]
      </span>
      {menu && <PlayerMenu initialTab={menu} onClose={() => setMenu(null)} />}
      {(() => {
        const l = notes.find((n) => n.kind === "levelup");
        return l?.level && !notes.some((n) => n.kind === "complete") ? (
          <LevelUp
            level={l.level}
            onAllocate={() => {
              clearLevelUp();
              setMenu("character");
            }}
            onLater={clearLevelUp}
          />
        ) : null;
      })()}
    </div>
  );
}

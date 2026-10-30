import { useState, useRef } from "react";
import { useGame } from "../../state/gamecontext";
import { Dungeon, type Room } from "../../data/land";
import { Item } from "../../data/items";
import { giveItem } from "../../systems/inventory";
import { progress, narrate } from "../../systems/quests";
import type { GameState } from "../../state/types";
import type { Note } from "../../systems/types";
import { SERIF } from "../../ui/cards";
import Battle from "../battle";
import Death from "../death";
import { surveyed } from "../../systems/dungeon";
import { Monster } from "../../data/monsters";
import { Location } from "../../data/locations";
import { type Spoils } from "../../systems/combat";
import PlayerMenu from "../menu/playerMenu";
import LevelUp from "../menu/levelUp";
import QuestComplete from "../world/questcomplete";
import { advance } from "../../systems/time";

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

export default function DungeonScreen() {
  const { state, changeState, rollback } = useGame();
  const [dead, setDead] = useState(false);
  const d = Dungeon.get(state.world.dungeon!);
  const room = d.rooms[state.world.room ?? d.entrance];
  const [notes, setNotes] = useState<Note[]>([]);
  const [fight, setFight] = useState<Room | null>(null);
  const before = useRef<GameState>(state);
  const [menu, setMenu] = useState<
    null | "inventory" | "character" | "skills" | "journal"
  >(null);
  const clearLevelUp = () =>
    setNotes(notes.filter((n) => n.kind !== "levelup"));
  const flag = (k: string) => `${k}:${d.id}:${room.id}`;

  const known = surveyed(state, d);
  const has = (k: string) => state.done.includes(flag(k));
  const apply = (n: GameState) =>
    (Object.keys(n) as (keyof GameState)[]).forEach((k) =>
      changeState(k, n[k])
    );

  const move = (to: string) => {
    if (Location.registry.has(to)) {
      changeState("world", {
        ...state.world,
        area: to,
        dungeon: undefined,
        room: undefined,
      });
      return;
    }
    const next = d.rooms[to];
    let s: GameState = { ...state, world: { ...state.world, room: to } };
    const out: Note[] = [];
    if (
      next.type === "trap" &&
      next.trap &&
      !s.done.includes(`trap:${d.id}:${to}`)
    ) {
      const t = next.trap,
        ok = (s.player.stats[t.stat] ?? 0) >= t.dc;
      out.push({ kind: "story", text: ok ? t.pass : t.fail });
      s = {
        ...s,
        done: [...s.done, `trap:${d.id}:${to}`],
        player: ok
          ? s.player
          : { ...s.player, hp: Math.max(1, s.player.hp - t.damage) },
      };
    }
    setNotes(out);
    apply(s);
  };

  const open = () => {
    let bag = state.bag;
    for (const l of room.loot ?? []) bag = giveItem(bag, l.id, l.qty ?? 1);
    setNotes([
      {
        kind: "reward",
        text: `Found: ${(room.loot ?? [])
          .map((l) => Item.get(l.id).name)
          .join(", ")}.`,
      },
    ]);
    apply({ ...state, bag, done: [...state.done, flag("chest")] });
  };

  const won = (sp: Spoils) => {
    let bag = { ...state.bag, gold: state.bag.gold + sp.gold };
    for (const id of sp.items) bag = giveItem(bag, id, 1);
    let s: GameState = { ...state, bag, done: [...state.done, flag("room")] };
    if (room.type === "boss") {
      const flags = [
        `cleared:${d.id}`,
        ...(d.kind === "dungeon"
          ? [`dormant:${d.id}:${s.time.dayId + d.dormancy}`]
          : []),
      ];
      s = progress(
        { ...s, done: [...s.done, ...flags] },
        { kind: "clear", dungeon: d.id }
      );
    }

    setFight(null);
    setNotes(narrate(before.current, s));
    apply(s);
  };

  const died = () => rollback();
  if (dead)
    return (
      <Death
        onContinue={() => {
          setDead(false);
          died();
        }}
      />
    );
  if (fight)
    return (
      <Battle
        monsters={fight.monsters ?? []}
        onWin={won}
        onFlee={() => setFight(null)}
        onDeath={() => setDead(true)}
      />
    );
  const hostile =
    (room.type === "combat" || room.type === "boss") && !has("room");
  return (
    <div style={wrap}>
      <div
        style={{
          opacity: 0.55,
          letterSpacing: "0.1em",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{d.name}</span>
        <span>
          {state.player.name} · {state.player.hp}/{state.player.maxHp} hp
        </span>
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: "inherit",
          fontWeight: 400,
          fontSize: "1.4em",
          letterSpacing: "0.06em",
          textTransform: "capitalize",
          color: "inherit",
        }}
      >
        {room.name}
      </h2>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{room.describe}</p>
      {known && (
        <div style={{ opacity: 0.6, fontSize: "0.9em" }}>
          {d.posting.monsters.map((m) => Monster.get(m).name).join(" · ")}
        </div>
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

      {hostile && (
        <button
          style={ptr}
          onClick={() => {
            before.current = state;
            setFight(room);
          }}
        >
          Fight
        </button>
      )}
      {room.type === "treasure" && !has("chest") && (
        <button style={ptr} onClick={open}>
          Open the crate
        </button>
      )}
      {room.harvest && !has("gather") && (
        <button
          style={ptr}
          onClick={() => {
            const h = room.harvest!;
            setNotes([{ kind: "story", text: h.text }]);
            apply({
              ...state,
              bag: giveItem(state.bag, h.id, h.qty ?? 1),
              time: h.hours ? advance(state.time, h.hours) : state.time,
              done: [...state.done, flag("gather")],
            });
          }}
        >
          Gather{room.harvest.hours ? ` · ${room.harvest.hours}h` : ""}
        </button>
      )}
      {room.type === "stat" && !has("stat") && (
        <button
          style={ptr}
          onClick={() => {
            setNotes([
              {
                kind: "story",
                text: "Something in the air here settles into you and stays.",
              },
            ]);
            apply({
              ...state,
              player: {
                ...state.player,
                statPoints: state.player.statPoints + 1,
              },
              done: [...state.done, flag("stat")],
            });
          }}
        >
          Sit a while
        </button>
      )}
      {!hostile &&
        room.exits.map((id) => {
          const dest = d.rooms[id] ?? Location.get(id);
          return (
            <button key={id} style={ptr} onClick={() => move(id)}>
              {d.rooms[id] ? "→" : "↑"} {dest.name}
            </button>
          );
        })}
      <span style={{ cursor: "pointer" }} onClick={() => setMenu("inventory")}>
        [ menu ]
      </span>
      {menu && <PlayerMenu initialTab={menu} onClose={() => setMenu(null)} />}
      {(() => {
        const c = notes.find((n) => n.kind === "complete");
        return c?.id ? (
          <QuestComplete
            id={c.id}
            onClose={() => setNotes(notes.filter((n) => n.kind !== "complete"))}
          />
        ) : null;
      })()}
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

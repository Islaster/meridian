import { useState } from "react";
import { useGame } from "../../../state/gamecontext";
import { Dungeon, type Room } from "../../../data/dungeons";
import { Item } from "../../../data/items";
import { giveItem } from "../../../systems/inventory";
import { progress, narrate } from "../../../systems/quests";
import type { GameState } from "../../../state/types";
import type { Note } from "../../../systems/types";
import { SERIF } from "../../landing/cards";
import Battle from "../battle";

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
  const { state, changeState } = useGame();
  const d = Dungeon.get(state.world.dungeon!);
  const room = d.rooms[state.world.room ?? d.entrance];
  const [notes, setNotes] = useState<Note[]>([]);
  const [fight, setFight] = useState<Room | null>(null);
  const flag = (k: string) => `${k}:${d.id}:${room.id}`;
  const has = (k: string) => state.done.includes(flag(k));
  const apply = (n: GameState) => {
    changeState("world", n.world);
    changeState("bag", n.bag);
    changeState("player", n.player);
    changeState("quests", n.quests);
    changeState("done", n.done);
  };

  const move = (to: string) => {
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
  const leave = () =>
    apply({
      ...state,
      world: {
        ...state.world,
        dungeon: undefined,
        room: undefined,
        area: "coast-road",
      },
    });
  const won = () => {
    let s: GameState = { ...state, done: [...state.done, flag("room")] };
    if (room.type === "boss")
      s = progress(
        { ...s, done: [...s.done, `cleared:${d.id}`] },
        { kind: "clear", dungeon: d.id }
      );
    setFight(null);
    setNotes(narrate(state, s));
    apply(s);
  };

  if (fight)
    return (
      <Battle
        monsters={fight.monsters ?? []}
        onWin={won}
        onFlee={() => setFight(null)}
      />
    );
  const hostile =
    (room.type === "combat" || room.type === "boss") && !has("room");
  return (
    <div style={wrap}>
      <div style={{ opacity: 0.55, letterSpacing: "0.1em" }}>
        {d.name} · {state.player.hp}/{state.player.maxHp} hp
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
      {notes.map((n, i) => (
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
        <button style={ptr} onClick={() => setFight(room)}>
          Fight
        </button>
      )}
      {room.type === "treasure" && !has("chest") && (
        <button style={ptr} onClick={open}>
          Open the crate
        </button>
      )}
      {!hostile &&
        room.exits.map((id) => (
          <button key={id} style={ptr} onClick={() => move(id)}>
            → {d.rooms[id].name}
          </button>
        ))}
      {!hostile && room.id === d.entrance && (
        <button style={ptr} onClick={leave}>
          Leave the cave
        </button>
      )}
    </div>
  );
}

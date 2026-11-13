import { usePlay, useMidnight } from "@/screens/play/useplay";
import Frame, { Log } from "@/screens/play/frame";
import { Dungeon } from "@/data/world/land";
import { Monster } from "@/data/monsters";
import { Item } from "@/data/items";
import { Location } from "@/data/world/locations";
import { dur } from "@/systems/time";
import {
  surveyed,
  here,
  hostile,
  packed,
  roomDone,
  step,
  leave,
  openChest,
  harvest,
  sit,
  winRoom,
} from "@/systems/dungeon";
import { ptr, para, heading, link, rowBetween } from "@/ui/styles";
import DungeonMap from "./map";

// Inside: one room at a time, each with the one thing it's for.
export default function DungeonScreen() {
  const play = usePlay();
  const { state, update, land } = play;
  const d = Dungeon.get(state.world.dungeon!);
  const room = here(state, d);
  const done = (k: string) => roomDone(state, d, room, k);
  const fight = hostile(state, d, room);
  useMidnight(
    play,
    packed(state, d) ? "camp" : "rough",
    room.name.toLowerCase()
  );

  const move = (to: string) => {
    if (Location.registry.has(to)) return update(leave(state, d, to));
    const r = step(state, d, to);
    land(state, r.state, r.notes);
  };
  const act = (next: typeof state, text?: string) =>
    land(state, next, text ? [{ kind: "story", text }] : []);

  return (
    <Frame play={play}>
      <div style={{ ...rowBetween, opacity: 0.55, letterSpacing: "0.1em" }}>
        <span>
          {d.name}
          {state.world.delve ? ` · ${dur(state.world.delve)} inside` : ""}
        </span>
        <span>
          {state.player.name} · {state.player.hp}/{state.player.maxHp} hp
        </span>
      </div>
      <h2 style={{ ...heading, textTransform: "capitalize" }}>{room.name}</h2>
      <p style={para}>{room.describe}</p>
      {surveyed(state, d) && (
        <div style={{ opacity: 0.6, fontSize: "0.9em" }}>
          {d.posting.monsters.map((m) => Monster.get(m).name).join(" · ")}
        </div>
      )}
      <Log play={play} />
      {d.plan ? (
        <DungeonMap
          state={state}
          d={d}
          room={room}
          locked={!!fight}
          onMove={move}
        />
      ) : (
        !fight &&
        room.exits.map((id) => (
          <button key={id} style={ptr} onClick={() => move(id)}>
            {d.rooms[id] ? "→" : "↑"} {(d.rooms[id] ?? Location.get(id)).name}
          </button>
        ))
      )}

      {fight && (
        <button
          style={ptr}
          onClick={() =>
            play.setFight({
              monsters: room.monsters ?? [],
              then: (s, sp) => winRoom(s, d, room, sp),
            })
          }
        >
          Fight
        </button>
      )}
      {room.type === "treasure" && !done("chest") && (
        <button
          style={ptr}
          onClick={() =>
            act(
              openChest(state, d, room),
              `Found: ${(room.loot ?? [])
                .map((l) => Item.get(l.id).name)
                .join(", ")}.`
            )
          }
        >
          Open the crate
        </button>
      )}
      {room.harvest && !done("gather") && (
        <button
          style={ptr}
          onClick={() => act(harvest(state, d, room), room.harvest!.text)}
        >
          Gather{room.harvest.hours ? ` · ${room.harvest.hours}h` : ""}
        </button>
      )}
      {room.type === "stat" && !done("stat") && (
        <button
          style={ptr}
          onClick={() =>
            act(
              sit(state, d, room),
              "Something in the air here settles into you and stays."
            )
          }
        >
          Sit a while
        </button>
      )}
      {packed(state, d) && !fight && (
        <button
          style={ptr}
          onClick={() => play.sleep("camp", room.name.toLowerCase())}
        >
          Make camp · sleep till morning
        </button>
      )}
      <span style={link} onClick={() => play.setMenu("inventory")}>
        [ menu ]
      </span>
    </Frame>
  );
}

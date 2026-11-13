import type { GameState } from "@/state/types";
import { Location } from "@/data/world/locations";
import type { Dungeon, Room } from "@/data/world/land";
import { surveyed, seen } from "@/systems/dungeon";
import { dur } from "@/systems/time";
import PlanView, { type Cell } from "@/ui/plan";
import { label, faint } from "@/ui/styles";

// The rooms, drawn: the one you're in, the ones you've stood in, and the doorways out of
// yours — a room you haven't found is a "?" until you step into it, unless the Guild's
// survey already named it. Click a doorway to go through; the way out is above the outline.
export default function DungeonMap({
  state,
  d,
  room,
  locked, // something in the room won't let you leave
  onMove,
}: {
  state: GameState;
  d: Dungeon;
  room: Room;
  locked: boolean;
  onMove: (to: string) => void;
}) {
  const out = room.exits.find((id) => !d.rooms[id]); // a location: the way out of here
  if (!d.plan) return null;
  const known = surveyed(state, d);
  const door = out && d.plan.door ? out : null; // the way out, drawn where the plan says
  const plan = door
    ? { ...d.plan, boxes: { ...d.plan.boxes, [door]: d.plan.door! } }
    : d.plan;
  const cells: Record<string, Cell> = {};
  if (door)
    cells[door] = {
      title: `↑ ${Location.get(door).name}`,
      note: room.exits.includes(door)
        ? locked
          ? "not now"
          : dur(d.pace)
        : undefined,
      dim: room.exits.includes(door) && locked,
      can: room.exits.includes(door) && !locked,
      out: true,
    };
  for (const id of Object.keys(d.plan.boxes)) {
    const r = d.rooms[id];
    const current = id === room.id;
    const next = room.exits.includes(id);
    const found = known || seen(state, d, id);
    if (!current && !next && !found) continue; // not drawn: you don't know it's there
    cells[id] = {
      title: found ? r.name : "?",
      note: current
        ? "you are here"
        : next
        ? locked
          ? "not now"
          : found
          ? dur(d.pace)
          : "unexplored"
        : undefined,
      here: current,
      dim: next && locked,
      can: next && !locked,
    };
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ ...label, display: "flex", gap: 16 }}>
        <span>{d.name}</span>
        {out && !door && (
          <span
            style={{
              cursor: locked ? "default" : "pointer",
              opacity: locked ? 0.4 : 1,
            }}
            onClick={() => !locked && onMove(out)}
          >
            ↑ {Location.get(out).name}
            <span style={faint}> · {dur(d.pace)}</span>
          </span>
        )}
      </div>
      <PlanView plan={plan} cells={cells} onPick={onMove} />
    </div>
  );
}

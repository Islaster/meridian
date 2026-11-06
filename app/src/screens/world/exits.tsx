import type { Town } from "./usetown";
import { ptr, dim, col } from "../../ui/styles";
import { Location } from "../../data/world/locations";
import { Dungeon } from "../../data/world/land";
import { isOpen, dur } from "../../systems/time";
import { hasItem } from "../../systems/inventory";
import { admission } from "../../systems/dungeon";
import { marks } from "../../systems/quests";
import { allowed } from "../../systems/tutorial";

export default function Exits({ t }: { t: Town }) {
  const { state, loc, sig } = t;
  return (
    <div style={col} data-tut="exits">
      {loc.exits.map((e) => {
        const dest = Dungeon.registry.has(e.to)
          ? Dungeon.get(e.to)
          : Location.get(e.to);
        const place = dest instanceof Location ? dest : undefined;
        const gate = dest instanceof Dungeon ? admission(state, dest) : null;
        const hours = place?.hours;
        const requires = place?.requires;
        const closed = !isOpen(hours, state.time);
        const locked = !!requires && !hasItem(state.bag, requires);
        const ok = allowed(state, { kind: "exit", id: e.to });
        const blocked = !!gate || closed || locked || !ok;
        const why = gate
          ? gate
          : closed
          ? `closed until ${hours!.open}:00`
          : locked
          ? "the door wants a key"
          : dur(e.hours);
        return (
          <button
            key={e.to}
            data-tut={sig.exits[e.to]?.size ? "way" : undefined}
            style={{ ...ptr, opacity: blocked ? 0.4 : 1 }}
            disabled={blocked}
            onClick={() => t.go(e.to, e.hours)}
          >
            → {dest.name}
            {dest instanceof Dungeon && dest.kind === "dungeon" && (
              <span style={dim}>
                {" "}
                · {dest.color} gate
                {dest.tempo !== 1 &&
                  ` · time runs ${dest.tempo < 1 ? "slow" : "fast"} beyond`}
              </span>
            )}
            {marks(sig.exits[e.to])}
            {why && <span style={dim}> · {why}</span>}
          </button>
        );
      })}
    </div>
  );
}

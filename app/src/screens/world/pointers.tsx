import type { World } from "./useworld";
import { ptr, greyed, dim, col } from "@/ui/styles";
import { marks } from "@/systems/quests";
import { allowed } from "@/systems/tutorial";
import { canCraft } from "@/systems/craft";
import { available } from "@/systems/actions";

// What you can do here: pointers, the counter, the board, the bench. People are on the map.
export default function Pointers({ w }: { w: World }) {
  const { state, loc, sig, loan } = w;
  return (
    <div style={col}>
      {available(loc, state).map((a) => {
        const short = !!a.gold && state.bag.gold < a.gold;
        const cost = [a.gold && `${a.gold} gold`, a.hours && `${a.hours}h`]
          .filter(Boolean)
          .join(" · ");
        const ok = allowed(state, { kind: "action", id: a.id });
        return (
          <button
            key={a.id}
            data-tut={sig.actions[a.id]?.size ? "marked" : undefined}
            style={greyed(short || !ok)}
            disabled={short || !ok}
            onClick={() => w.act(a)}
          >
            {a.label}
            {marks(sig.actions[a.id])}
            {cost && <span style={dim}> · {cost}</span>}
          </button>
        );
      })}
      {loc.shop && (
        <button
          style={greyed(!allowed(state, { kind: "shop" }))}
          disabled={!allowed(state, { kind: "shop" })}
          onClick={() => w.setPanel("shop")}
        >
          {loc.shop.name ?? "The counter"}
          <span style={dim}>
            {" "}
            · buy & sell · {Math.round(loc.shop.cut * 100)}% cut
          </span>
        </button>
      )}
      {loc.board && (
        <button
          style={greyed(
            state.player.rank < 1 || !allowed(state, { kind: "board" })
          )}
          disabled={!allowed(state, { kind: "board" })}
          onClick={w.openBoard}
        >
          The posting board
          {marks(sig.board)}
          {state.player.rank < 1 && (
            <span style={dim}> ({state.player.name} needs a guild card)</span>
          )}
        </button>
      )}
      {loc.bench && (
        <button
          data-tut="bench"
          style={ptr}
          onClick={() => w.setPanel("bench")}
        >
          {loc.bench.label}
          {!canCraft(state, loc.bench.craft) && (
            <span style={dim}> · basics only</span>
          )}
        </button>
      )}
      {loan?.map((lo) => (
        <button key={lo.id} style={ptr} onClick={() => w.take(lo)}>
          {lo.name}
          <span style={dim}> · {lo.blurb}</span>
        </button>
      ))}
    </div>
  );
}

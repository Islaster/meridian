import type { Town } from "./usetown";
import { ptr, dim, col, hollow } from "../../shared/styles";
import { Npc } from "../../data/locations";
import { present } from "../../systems/presence";
import { owned, buildable, shortfall, costText } from "../../systems/property";
import { meets, marks } from "../../systems/quests";
import { allowed } from "../../systems/tutorial";
import { canCraft } from "../../systems/craft";
import { actionsAt } from "../../systems/actions";

export default function Pointers({ t }: { t: Town }) {
  const { state, loc, sig, offer } = t;
  const actions = actionsAt(loc, state).filter(
    (a) =>
      (!a.quest || state.quests[a.quest]?.status === "taken") &&
      !state.done.includes(`act:${a.id}`) &&
      (!a.requires || meets(state, a.requires))
  );
  const shopOk = allowed(state, { kind: "shop" });
  const boardOk = allowed(state, { kind: "board" });
  return (
    <div style={col}>
      {actions.map((a) => {
        const short = !!a.gold && state.bag.gold < a.gold;
        const cost = [a.gold && `${a.gold} gold`, a.hours && `${a.hours}h`]
          .filter(Boolean)
          .join(" · ");
        const ok = allowed(state, { kind: "action", id: a.id });
        return (
          <button
            key={a.id}
            style={{ ...ptr, opacity: short || !ok ? 0.4 : 1 }}
            disabled={short || !ok}
            onClick={() => t.act(a)}
          >
            {a.label}
            {marks(sig.actions[a.id])}
            {cost && <span style={dim}> · {cost}</span>}
          </button>
        );
      })}
      {owned(state, loc) &&
        buildable(state, loc).map((u) => {
          const why = shortfall(state, u);
          return (
            <button
              key={u.id}
              style={{ ...ptr, opacity: why ? 0.4 : 1 }}
              disabled={!!why}
              onClick={() => t.raise(u)}
            >
              Build {u.name}
              <span style={dim}>
                {" "}
                · {u.opens} · {why ?? costText(u)}
              </span>
            </button>
          );
        })}
      {present(state, loc).map((id) => {
        const ok = allowed(state, { kind: "npc", id });
        return (
          <button
            key={id}
            style={{ ...ptr, opacity: ok ? 1 : 0.4 }}
            disabled={!ok}
            onClick={() => t.talk(id)}
          >
            Talk to {Npc.get(id).name}
            {sig.available.has(id) && " ?"}
            {sig.pending.has(id) && <span style={hollow}> ?</span>}
            {marks(sig.npcs[id])}
          </button>
        );
      })}
      {loc.shop && (
        <button
          style={{ ...ptr, opacity: shopOk ? 1 : 0.4 }}
          disabled={!shopOk}
          onClick={() => t.setShop(true)}
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
          style={{
            ...ptr,
            opacity: state.player.rank < 1 || !boardOk ? 0.4 : 1,
          }}
          disabled={!boardOk}
          onClick={t.openBoard}
        >
          The posting board
          {marks(sig.board)}
          {state.player.rank < 1 && (
            <span style={dim}> ({state.player.name} needs a guild card)</span>
          )}
        </button>
      )}
      {loc.bench && (
        <button data-tut="bench" style={ptr} onClick={() => t.setBench(true)}>
          {loc.bench.label}
          {!canCraft(state, loc.bench.craft) && (
            <span style={dim}> · basics only</span>
          )}
        </button>
      )}
      {offer?.map((lo) => (
        <button key={lo.id} style={ptr} onClick={() => t.take(lo)}>
          {lo.name}
          <span style={dim}> · {lo.blurb}</span>
        </button>
      ))}
    </div>
  );
}

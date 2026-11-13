import type { World } from "./useworld";
import { Npc } from "@/data/world/locations";
import { topics } from "@/systems/actions";
import { allowed } from "@/systems/tutorial";
import { marks } from "@/systems/quests";
import Shop from "@/screens/shop";
import GuildBoard from "@/screens/board";
import Forge from "@/screens/forge";
import Figure from "@/ui/figure";
import { para, ptr, greyed, dim, dock, link } from "@/ui/styles";

// The stage: what you're doing, pinned to the bottom of the view. A conversation is the
// person's line and the things you can say or ask — their pointers, posted here, as choices.
// The counter, the board and the bench open the same way. One thing at a time.
export default function Stage({ w }: { w: World }) {
  const { state, loc, sig, focus, line, loan } = w;
  const close = () => w.setFocus(null);
  if (!focus) return null;
  let body = null;
  if (focus === "shop" && loc.shop)
    body = <Shop shop={loc.shop} onClose={close} />;
  else if (focus === "bench" && loc.bench)
    body = (
      <Forge craft={loc.bench.craft} title={loc.bench.label} onClose={close} />
    );
  else if (focus === "board")
    body =
      state.player.rank >= 1 ? (
        <GuildBoard onClose={close} onPick={w.pickPosting} />
      ) : (
        line && <p style={{ ...para, opacity: 0.85 }}>“{line}”</p>
      );
  else if (Npc.registry.has(focus)) {
    const n = Npc.get(focus);
    body = (
      <>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span style={{ ...dim, fontSize: "0.85em", letterSpacing: "0.1em" }}>
            <Figure />
            {n.name}
          </span>
          <span style={{ ...link, ...dim }} onClick={close}>
            [ leave ]
          </span>
        </div>
        {line && <p style={{ ...para, opacity: 0.85 }}>“{line}”</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {topics(n, loc, state).map((a) => {
            const short = !!a.gold && state.bag.gold < a.gold;
            const ok = allowed(state, { kind: "action", id: a.id });
            const cost = [a.gold && `${a.gold} gold`, a.hours && `${a.hours}h`]
              .filter(Boolean)
              .join(" · ");
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
          {loan?.map((lo) => (
            <button key={lo.id} style={ptr} onClick={() => w.take(lo)}>
              {lo.name}
              <span style={dim}> · {lo.blurb}</span>
            </button>
          ))}
        </div>
      </>
    );
  }
  return body && <div style={dock}>{body}</div>;
}

import type { World } from "./useworld";
import { Npc } from "@/data/world/locations";
import Shop from "@/screens/shop";
import GuildBoard from "@/screens/board";
import Forge from "@/screens/forge";
import QuestOffer from "@/screens/menu/questoffers";
import { para, ptr, dim, sheet } from "@/ui/styles";

// What opened under the layout: the person you picked and what they said, the counter,
// the board, the bench, an offer. One thing at a time; the layout stays above it.
export default function Below({ w }: { w: World }) {
  const { loc, focus, line, loan, prompt, setPrompt } = w;
  const close = () => w.setFocus(null);
  const done = w.play.notes.some((n) => n.kind === "complete");
  if (!focus) return null;
  if (focus === "shop" && loc.shop)
    return <Shop shop={loc.shop} onClose={close} />;
  if (focus === "bench" && loc.bench)
    return (
      <Forge craft={loc.bench.craft} title={loc.bench.label} onClose={close} />
    );
  if (focus === "board")
    return w.state.player.rank >= 1 ? (
      <GuildBoard onClose={close} onPick={w.pickPosting} />
    ) : (
      line && <p style={{ ...para, opacity: 0.85 }}>“{line}”</p>
    );
  if (!Npc.registry.has(focus)) return null;
  return (
    <div style={sheet}>
      <div style={{ ...dim, fontSize: "0.85em", letterSpacing: "0.1em" }}>
        {Npc.get(focus).name}
      </div>
      {line && <p style={{ ...para, opacity: 0.85 }}>“{line}”</p>}
      {loan?.map((lo) => (
        <button key={lo.id} style={ptr} onClick={() => w.take(lo)}>
          {lo.name}
          <span style={dim}> · {lo.blurb}</span>
        </button>
      ))}
      {prompt && !done && (
        <QuestOffer id={prompt} onClose={() => setPrompt(null)} />
      )}
    </div>
  );
}

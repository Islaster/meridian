import { useGame } from "../../state/gamecontext";
import { SERIF, MenuButton } from "../../ui/cards";
import { Dungeon, RANKS } from "../../data/world/land";
import { Monster } from "../../data/monsters";
import { Item } from "../../data/items";
import { Quest } from "../../data/quests";
import { admission, findable, ownerName } from "../../systems/dungeon";
import { GLYPH, unmet, meets } from "../../systems/quests";

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.96)",
  color: "rgba(233,236,242,0.92)",
  font: `400 clamp(14px, 1.4vw, 18px) ${SERIF}`,
  padding: "48px 24px",
  overflowY: "auto" as const,
};

const panel = {
  maxWidth: 640,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column" as const,
  gap: 14,
};

const label = {
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  fontSize: "0.85em",
  opacity: 0.6,
  marginTop: 12,
};
const entry = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 4,
  padding: "8px 0",
  borderBottom: "1px solid rgba(233,236,242,0.1)",
};

const dim = { opacity: 0.6, fontSize: "0.9em" };

const btn = {
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: "1px solid rgba(233,236,242,0.28)",
  padding: "2px 10px",
  cursor: "pointer",
  alignSelf: "flex-start" as const,
};

const itemNames = (ids: string[]) =>
  ids.map((id) => Item.get(id).name).join(", ");

export default function GuildBoard({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  const { state } = useGame();
  const postings = [...Quest.registry.values()].filter(
    (q) =>
      (q.kind === "bounty" || q.kind === "mission") && meets(state, q.visible)
  );
  const known = [...Dungeon.registry.values()].filter((d) => d.known);
  console.log("board", {
    postings: postings.map((q) => q.id),
    known: known.map((d) => d.id),
  });
  for (const d of known) {
    for (const m of d.posting.monsters)
      if (!Monster.registry.has(m))
        console.log("board: missing monster", d.id, "→", m);
    for (const i of d.posting.materials ?? [])
      if (!Item.registry.has(i))
        console.log("board: missing item", d.id, "→", i);
  }

  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={{ ...label, marginTop: 0 }}>The posting board</div>

        <div style={label}>Postings</div>
        {postings.length === 0 && <div style={dim}>Nothing posted today.</div>}
        {postings.map((q) => {
          const p = state.quests[q.id];
          const again =
            p?.status === "complete" && q.repeat ? (p.day ?? 0) + q.repeat : 0;
          const open = !p || (again > 0 && again <= state.time.dayId);
          const why = open ? unmet(state, q.acceptable) : null;
          const note =
            p?.status === "taken"
              ? "taken"
              : !open && again
              ? `posted again on day ${again}`
              : !open
              ? "done"
              : why;
          return (
            <div key={q.id} style={entry}>
              <div>
                {GLYPH[q.kind]} {q.name}{" "}
                <span style={dim}>· {q.reward.gold ?? 0} gold</span>
              </div>
              <div style={dim}>{q.objective}</div>
              {note ? (
                <div style={dim}>{note}</div>
              ) : (
                <button style={btn} onClick={() => !note && onPick(q.id)}>
                  Accept
                </button>
              )}
            </div>
          );
        })}

        <div style={label}>Known dungeons</div>
        {known.length === 0 && (
          <div style={dim}>No surveyed ground on the Guild's books.</div>
        )}
        {known.map((d) => {
          const why = admission(state, d),
            f = findable(d);
          return (
            <div key={d.id} style={entry}>
              <div>
                {d.name}
                <span style={dim}>
                  {" "}
                  · {ownerName(d)} · Lv {d.posting.level} · Rank{" "}
                  {RANKS[d.posting.rank]} · Party {d.posting.party[0]}–
                  {d.posting.party[1]}
                  {why && ` · ${why}`}
                </span>
              </div>
              <div style={dim}>{d.posting.environment}</div>
              <div style={dim}>
                Yields {itemNames(f.environment)} · Monsters{" "}
                {d.posting.monsters.map((m) => Monster.get(m).name).join(", ")}
                {f.drops.length > 0 && ` · Drops ${itemNames(f.drops)}`}
                {f.loot.length > 0 && ` · Loot ${itemNames(f.loot)}`}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 16, alignSelf: "center" }}>
          <MenuButton label="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

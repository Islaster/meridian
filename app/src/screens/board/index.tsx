import { useGame } from "@/state/game";
import MenuButton from "@/ui/menubutton";
import { Dungeon, RANKS } from "@/data/world/land";
import { Monster } from "@/data/monsters";
import { Item } from "@/data/items";
import { Quest } from "@/data/quests";
import { admission, findable, ownerName } from "@/systems/dungeon";
import { GLYPH } from "@/systems/quests";
import { unmet, meets } from "@/systems/requirements";
import { sheet, label, entry, small } from "@/ui/styles";

const dimmed = { opacity: 0.6, fontSize: "0.9em" };
const names = (ids: string[]) => ids.map((id) => Item.get(id).name).join(", ");

// The Guild's board: postings to take, and the ground on its books.
export default function GuildBoard({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  const { state } = useGame();
  const postings = Quest.all().filter(
    (q) =>
      (q.kind === "bounty" || q.kind === "mission") && meets(state, q.visible)
  );
  const known = Dungeon.all().filter((d) => d.known);

  return (
    <div style={sheet}>
      <div style={label}>The posting board</div>

      <div style={{ ...label, marginTop: 12 }}>Postings</div>
      {postings.length === 0 && <div style={dimmed}>Nothing posted today.</div>}
      {postings.map((q) => {
        const p = state.quests[q.id];
        const again =
          p?.status === "complete" && q.repeat ? (p.day ?? 0) + q.repeat : 0;
        const open = !p || (again > 0 && again <= state.time.dayId);
        const note =
          p?.status === "taken"
            ? "taken"
            : !open && again
            ? `posted again on day ${again}`
            : !open
            ? "done"
            : unmet(state, q.acceptable);
        return (
          <div key={q.id} style={entry}>
            <div>
              {GLYPH[q.kind]} {q.name}{" "}
              <span style={dimmed}>· {q.reward.gold ?? 0} gold</span>
            </div>
            <div style={dimmed}>{q.objective}</div>
            {note ? (
              <div style={dimmed}>{note}</div>
            ) : (
              <button
                style={{ ...small, alignSelf: "flex-start" }}
                onClick={() => onPick(q.id)}
              >
                Accept
              </button>
            )}
          </div>
        );
      })}

      <div style={{ ...label, marginTop: 12 }}>Known dungeons</div>
      {known.length === 0 && (
        <div style={dimmed}>No surveyed ground on the Guild's books.</div>
      )}
      {known.map((d) => {
        const why = admission(state, d),
          f = findable(d);
        return (
          <div key={d.id} style={entry}>
            <div>
              {d.name}
              <span style={dimmed}>
                {" "}
                · {ownerName(d)} · Lv {d.posting.level} · Rank{" "}
                {RANKS[d.posting.rank]} · Party {d.posting.party[0]}–
                {d.posting.party[1]}
                {why && ` · ${why}`}
              </span>
            </div>
            <div style={dimmed}>{d.posting.environment}</div>
            <div style={dimmed}>
              Yields {names(f.environment)} · Monsters{" "}
              {d.posting.monsters.map((m) => Monster.get(m).name).join(", ")}
              {f.drops.length > 0 && ` · Drops ${names(f.drops)}`}
              {f.loot.length > 0 && ` · Loot ${names(f.loot)}`}
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 16, alignSelf: "center" }}>
        <MenuButton label="Close" onClick={onClose} />
      </div>
    </div>
  );
}

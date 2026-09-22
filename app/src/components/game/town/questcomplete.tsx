import { SERIF, MenuButton } from "../../landing/cards";
import { Quest } from "../../../data/quests";
import { Item } from "../../../data/items";

export default function QuestComplete({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const q = Quest.get(id),
    r = q.reward;
  const rewards = [
    r.xp && `${r.xp} xp`,
    r.gold && `${r.gold} gold`,
    ...(r.items ?? []).map((i) => Item.get(i).name),
  ].filter(Boolean) as string[];
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.94)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        padding: 24,
        font: `400 clamp(15px, 1.6vw, 20px) ${SERIF}`,
        color: "rgba(233,236,242,0.92)",
        textAlign: "center",
      }}
    >
      <div style={{ letterSpacing: "0.3em", fontSize: "0.75em", opacity: 0.6 }}>
        QUEST COMPLETE
      </div>
      <div style={{ fontSize: "1.5em", letterSpacing: "0.06em" }}>{q.name}</div>
      <div
        style={{ width: 120, height: 1, background: "rgba(233,236,242,0.3)" }}
      />
      {q.epilogue && (
        <p style={{ maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
          {q.epilogue}
        </p>
      )}
      {rewards.length > 0 && (
        <div style={{ opacity: 0.7, letterSpacing: "0.08em" }}>
          {rewards.join("  ·  ")}
        </div>
      )}
      <MenuButton label="Continue" onClick={onClose} />
    </div>
  );
}

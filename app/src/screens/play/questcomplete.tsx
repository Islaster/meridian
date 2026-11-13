import Card from "@/ui/card";
import { Quest } from "@/data/quests";
import { Item } from "@/data/items";
import { para } from "@/ui/styles";

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
  ].filter(Boolean);
  return (
    <Card
      kicker="QUEST COMPLETE"
      title={q.name}
      buttons={[{ label: "Continue", onClick: onClose }]}
    >
      {q.epilogue && <p style={{ ...para, maxWidth: 560 }}>{q.epilogue}</p>}
      {rewards.length > 0 && (
        <div style={{ opacity: 0.7, letterSpacing: "0.08em" }}>
          {rewards.join("  ·  ")}
        </div>
      )}
    </Card>
  );
}

import Card from "@/ui/card";
import { useGame } from "@/state/game";

export default function LevelUp({
  level,
  onAllocate,
  onLater,
}: {
  level: number;
  onAllocate: () => void;
  onLater: () => void;
}) {
  const p = useGame().state.player;
  const n = (k: number, what: string) =>
    `${k} ${what} point${k === 1 ? "" : "s"}`;
  return (
    <Card
      kicker="LEVEL UP"
      title={level}
      big
      buttons={[
        { label: "Allocate now", onClick: onAllocate },
        { label: "Later", onClick: onLater },
      ]}
    >
      <div style={{ opacity: 0.75, letterSpacing: "0.06em" }}>
        {n(p.statPoints, "stat")} to allocate
        {p.skillPoints > 0 && ` · ${n(p.skillPoints, "skill")}`}
      </div>
    </Card>
  );
}

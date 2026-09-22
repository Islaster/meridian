import { SERIF, MenuButton } from "../../landing/cards";
import { useGame } from "../../../state/gamecontext";

export default function LevelUp({
  level,
  onAllocate,
  onLater,
}: {
  level: number;
  onAllocate: () => void;
  onLater: () => void;
}) {
  const { state } = useGame();
  const p = state.player;
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
        LEVEL UP
      </div>
      <div style={{ fontSize: "2.4em", letterSpacing: "0.1em" }}>{level}</div>
      <div
        style={{ width: 120, height: 1, background: "rgba(233,236,242,0.3)" }}
      />
      <div style={{ opacity: 0.75, letterSpacing: "0.06em" }}>
        {p.statPoints} stat point{p.statPoints === 1 ? "" : "s"} to allocate
        {p.skillPoints > 0 &&
          ` · ${p.skillPoints} skill point${p.skillPoints === 1 ? "" : "s"}`}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
        <MenuButton label="Allocate now" onClick={onAllocate} />
        <MenuButton label="Later" onClick={onLater} />
      </div>
    </div>
  );
}

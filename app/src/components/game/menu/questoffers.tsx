import { useGame } from "../../../state/gamecontext";
import { Quest } from "../../../data/quests";
import { accept, decline, GLYPH } from "../../../systems/quests";
import { SERIF, MenuButton } from "../../landing/cards";
import LedgerLine from "../../shared/ledgerline";

export default function QuestOffer({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { state, changeState } = useGame();
  const q = Quest.get(id);
  const apply = (s: typeof state) => {
    changeState("quests", s.quests);
    changeState("offered", s.offered);
    changeState("done", s.done);
    onClose();
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 40,
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "#000",
          border: "1px solid rgba(233,236,242,0.2)",
          padding: "28px 32px",
          color: "rgba(233,236,242,0.92)",
          font: `400 clamp(15px, 1.5vw, 19px) ${SERIF}`,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <LedgerLine>《Offered》</LedgerLine>
        <div style={{ fontSize: "1.2em" }}>
          {GLYPH[q.kind]} {q.name}
        </div>
        <div style={{ opacity: 0.7, lineHeight: 1.5 }}>
          {q.stages[0].objective}
        </div>
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}
        >
          <MenuButton label="Accept" onClick={() => apply(accept(state, id))} />
          {q.kind !== "main" && (
            <MenuButton
              label="Deny"
              onClick={() => apply(decline(state, id))}
            />
          )}
          <MenuButton label="Delay" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

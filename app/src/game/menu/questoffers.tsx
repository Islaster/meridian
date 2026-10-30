import { useGame } from "../../state/gamecontext";
import { Quest } from "../../data/quests";
import { accept, unmet, GLYPH } from "../../systems/quests";
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
  const why = unmet(state, q.acceptable);
  const take = () => {
    changeState("quests", accept(state, id).quests);
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
        <div style={{ opacity: 0.7, lineHeight: 1.5 }}>{q.objective}</div>
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}
        >
          <MenuButton
            label={why ? `Accept · ${why}` : "Accept"}
            onClick={() => {
              if (!why) take();
            }}
          />
          <MenuButton label="Later" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

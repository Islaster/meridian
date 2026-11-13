import { useGame } from "@/state/game";
import { Quest } from "@/data/quests";
import { accept, GLYPH } from "@/systems/quests";
import { unmet } from "@/systems/requirements";
import MenuButton from "@/ui/menubutton";
import LedgerLine from "@/ui/ledgerline";
import { dialog, dialogBox } from "@/ui/styles";

// Someone just offered work. Take it, or leave it in the journal for later.
export default function QuestOffer({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { state, update } = useGame();
  const q = Quest.get(id);
  const why = unmet(state, q.acceptable);
  return (
    <div style={dialog}>
      <div style={dialogBox()}>
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
              if (why) return;
              update(accept(state, id));
              onClose();
            }}
          />
          <MenuButton label="Later" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

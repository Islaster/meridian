import { useGame } from "@/state/game";
import { offered, takeName, leaveName } from "@/systems/ledger";
import { progress } from "@/systems/quests";
import { Skill } from "@/data/skills";
import MenuButton from "./menubutton";
import LedgerLine from "./ledgerline";
import { GRADE_NAME, graded } from "./grade";
import { dialog, dialogBox } from "./styles";

// The Ledger's line: a 《Phantasm》 name, offered once, fully readable, taken or left. Shows wherever you are.
export default function Ledger() {
  const { state, update } = useGame();
  const c = offered(state);
  if (!c || state.player.hp <= 0) return null;
  const opens = c.skills.map((id) => Skill.get(id).name);
  return (
    <div style={{ ...dialog, zIndex: 55 }}>
      <div style={dialogBox(560)}>
        <LedgerLine>《The Ledger》</LedgerLine>
        <div style={{ opacity: 0.7, lineHeight: 1.5 }}>
          A line opens at the edge of sight, in the pale hand that records. It
          has written a name.
        </div>
        <div style={{ fontSize: "1.3em", ...graded(c.grade) }}>
          {c.name}{" "}
          <span
            style={{ fontSize: "0.65em", opacity: 0.8, letterSpacing: "0.1em" }}
          >
            《{GRADE_NAME[c.grade]}》
          </span>
        </div>
        {c.describe && <div style={{ lineHeight: 1.5 }}>{c.describe}</div>}
        {opens.length > 0 && (
          <div style={{ opacity: 0.7, lineHeight: 1.5 }}>
            Opens: {opens.join(" · ")}
          </div>
        )}
        <div style={{ opacity: 0.7, lineHeight: 1.5 }}>
          No master stands behind it. Take it and it is yours, on top of every
          other name you hold, and its own work will follow in the journal.
          Leave it and the line closes; it does not open twice. The Ledger
          writes one such name, ever.
        </div>
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}
        >
          <MenuButton
            label="Take the name"
            onClick={() => update(progress(takeName(c.id)(state), null))}
          />
          <MenuButton
            label="Leave it unwritten"
            onClick={() => update(leaveName(c.id)(state))}
          />
        </div>
      </div>
    </div>
  );
}

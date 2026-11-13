import { useEffect, useState } from "react";
import { useGame } from "@/state/game";
import { overlay, panel } from "@/ui/styles";
import Tabs from "@/ui/tabs";
import MenuButton from "@/ui/menubutton";
import Coachmark from "@/ui/coachmark";
import { currentIn, dismiss } from "@/systems/tutorial";
import type { MenuTab } from "@/data/tutorial";
import Inventory from "./inventory";
import Sheet from "./sheet";
import Skills from "./skills";
import Journal from "./journal";

const TABS: readonly MenuTab[] = [
  "inventory",
  "character",
  "skills",
  "journal",
];

// The menu: four tabs over the scene. The clock waits while it's open.
export default function PlayerMenu({
  onClose,
  initialTab = "inventory",
}: {
  onClose: () => void;
  initialTab?: MenuTab;
}) {
  const { state, update } = useGame();
  const [picked, setPicked] = useState<MenuTab>(initialTab);
  const [wide, setWide] = useState(false); // a tab asking for room — the gear card open
  const walk = currentIn(state, "menu"); // the menu's own walkthrough, the first time it's open
  const tab = walk?.step.tab ?? picked; // a step that names a tab shows it
  // Escape closes the menu — unless a tab claims the key first (the gear card)
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  return (
    <div style={overlay}>
      <div style={panel(tab === "character" || wide ? 960 : 640)}>
        <Tabs tabs={TABS} value={tab} onPick={setPicked} />
        {tab === "inventory" && <Inventory onWide={setWide} />}
        {tab === "character" && <Sheet />}
        {tab === "skills" && <Skills />}
        {tab === "journal" && <Journal />}
        <div style={{ marginTop: 16, alignSelf: "center" }} data-tut="close">
          <MenuButton label="Close" onClick={onClose} />
        </div>
        {walk && (
          <Coachmark
            title={walk.tutorial.title}
            text={walk.step.text}
            target={walk.step.target}
            onDone={() => update(dismiss(state, walk.step))}
          />
        )}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { FONT_CARD, INK, BLACK } from "./theme";
import { rule } from "./styles";
import MenuButton from "./menubutton";

// A full-screen card with a kicker, a title, a rule, whatever follows, and one or two buttons:
// quest complete, level up, death.
export default function Card({
  kicker,
  title,
  children,
  buttons,
  big,
}: {
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
  buttons: { label: string; onClick: () => void }[];
  big?: boolean; // the title as a number
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: BLACK,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        padding: 24,
        font: FONT_CARD,
        color: INK,
        textAlign: "center",
        zIndex: 50,
      }}
    >
      <div style={{ letterSpacing: "0.3em", fontSize: "0.75em", opacity: 0.6 }}>
        {kicker}
      </div>
      <div
        style={{
          fontSize: big ? "2.4em" : "1.5em",
          letterSpacing: big ? "0.1em" : "0.06em",
        }}
      >
        {title}
      </div>
      <div style={rule} />
      {children}
      <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
        {buttons.map((b) => (
          <MenuButton key={b.label} label={b.label} onClick={b.onClick} />
        ))}
      </div>
    </div>
  );
}

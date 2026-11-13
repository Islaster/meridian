import { FONT_CARD } from "./theme";

// The big button: Continue, Close, New game.
export default function MenuButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        font: FONT_CARD,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "rgba(233,236,242,0.78)",
        background: "transparent",
        border: "1px solid rgba(233,236,242,0.25)",
        padding: "10px 34px",
        cursor: "pointer",
        minWidth: "clamp(220px, 24vw, 320px)",
      }}
    >
      {label}
    </button>
  );
}

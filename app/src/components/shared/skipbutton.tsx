import type { CSSProperties } from "react";
import { SERIF } from "../landing/cards";

const base: CSSProperties = {
  position: "absolute",
  right: 28,
  bottom: 24,
  font: `13px ${SERIF}`,
  letterSpacing: "0.06em",
  color: "rgba(233,236,242,0.6)",
  background: "transparent",
  border: "1px solid rgba(233,236,242,0.28)",
  borderRadius: 2,
  padding: "7px 16px",
  cursor: "pointer",
};

export default function SkipButton({
  onClick,
  label = "Skip",
  style,
}: {
  onClick: () => void;
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <button onClick={onClick} style={{ ...base, ...style }}>
      {label}
    </button>
  );
}

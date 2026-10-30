import type { CSSProperties } from "react";
import { SERIF } from "./cards";

export const wrap: CSSProperties = {
  minHeight: "100vh",
  background: "#000",
  color: "rgba(233,236,242,0.92)",
  font: `400 clamp(15px, 1.5vw, 19px) ${SERIF}`,
  padding: "48px 24px",
  maxWidth: 720,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: 18,
};
export const col: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
};
export const ptr: CSSProperties = {
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: "1px solid rgba(233,236,242,0.28)",
  padding: "8px 16px",
  cursor: "pointer",
  textAlign: "left",
};
export const dim: CSSProperties = { opacity: 0.6 };
export const para: CSSProperties = { margin: 0, lineHeight: 1.6 };
export const hollow: CSSProperties = {
  WebkitTextStroke: "1px currentColor",
  color: "transparent",
};
export const label: CSSProperties = {
  fontSize: "0.75em",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  opacity: 0.5,
};
export const rail: CSSProperties = {
  borderLeft: "1px solid rgba(233,236,242,0.28)",
  paddingLeft: 14,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

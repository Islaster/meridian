import type { CSSProperties } from "react";
import {
  BLACK,
  FILL_OFF,
  FONT_BODY,
  FONT_PANEL,
  INK,
  LINE,
  LINE_FAINT,
} from "./theme";

// Every shared style, once. A screen composes these; it doesn't declare its own copies.

// a full screen of reading: the world, a dungeon
export const wrap: CSSProperties = {
  minHeight: "100vh",
  background: BLACK,
  color: INK,
  font: FONT_BODY,
  padding: "clamp(20px, 5vw, 48px) clamp(16px, 3vw, 24px)",
  maxWidth: 720,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: 18,
};
// a full screen centered on one thing: a passage, a card
export const stage: CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  background: BLACK,
  color: INK,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 28,
  padding: 24,
  boxSizing: "border-box",
};
// a panel over the scene: the menu, the board, the forge
export const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.96)",
  color: INK,
  font: FONT_PANEL,
  padding: "clamp(20px, 5vw, 48px) clamp(16px, 3vw, 24px)",
  overflowY: "auto",
  zIndex: 40,
};
export const panel = (maxWidth = 640): CSSProperties => ({
  maxWidth,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: 16,
});
// a smaller box over the scene, dimmed around: an offer, the Ledger's line
export const dialog: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.86)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  zIndex: 45,
};
export const dialogBox = (width = 520): CSSProperties => ({
  width: `min(${width}px, 100%)`,
  maxHeight: "80vh",
  overflowY: "auto",
  background: BLACK,
  border: `1px solid rgba(233,236,242,0.2)`,
  padding: "28px 32px",
  color: INK,
  font: FONT_BODY,
  display: "flex",
  flexDirection: "column",
  gap: 18,
});

export const col: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
};
export const rowBetween: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};
// a line in a list, ruled under
export const row: CSSProperties = {
  ...rowBetween,
  padding: "6px 0",
  borderBottom: `1px solid ${LINE_FAINT}`,
};
// an entry with lines under a heading
export const entry: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: "8px 0",
  borderBottom: `1px solid ${LINE_FAINT}`,
};
export const box: CSSProperties = {
  border: `1px solid ${LINE}`,
  padding: "10px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  minWidth: 180,
};

// a pointer: something in the scene to activate
export const ptr: CSSProperties = {
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: `1px solid ${LINE}`,
  padding: "8px 16px",
  cursor: "pointer",
  textAlign: "left",
};
// a small button beside a line: Equip, Use, Track
export const small: CSSProperties = {
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: `1px solid ${LINE}`,
  padding: "2px 10px",
  cursor: "pointer",
};
// a choice among a few: tabs, sorts
export const chip = (on: boolean): CSSProperties => ({
  cursor: "pointer",
  opacity: on ? 1 : 0.45,
  fontSize: "0.85em",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
});
// a pointer that's unavailable, with its reason beside it
export const greyed = (why: string | null | boolean): CSSProperties => ({
  ...ptr,
  opacity: why ? 0.4 : 1,
});

// a person: the one solid thing on the page — a filled name you can pick, ringed while you're talking to them
export const pill = (on: boolean, ok = true): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "5px 12px 5px 10px",
  border: `1px solid ${INK}`,
  borderRadius: 999,
  background: INK,
  color: BLACK,
  boxShadow: on ? `0 0 0 2px ${BLACK}, 0 0 0 3px ${INK}` : "none",
  opacity: ok ? 1 : 0.4,
  cursor: ok ? "pointer" : "default",
  fontSize: "0.9em",
});
// the dock: what you're doing, pinned to the bottom of the view so it never needs a scroll —
// a conversation, the counter, the board, the bench
export const dock: CSSProperties = {
  position: "sticky",
  bottom: 0,
  zIndex: 30,
  background: BLACK,
  borderTop: `1px solid ${LINE}`,
  padding: "14px 0 12px",
  maxHeight: "48vh",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 14,
};
// a panel inside the dock
export const sheet: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};
export const dim: CSSProperties = { opacity: 0.6 };
// the small line under a name on a plan: a cost, a reason, who's there
export const faint: CSSProperties = { opacity: 0.55, fontSize: "0.9em" };
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
export const heading: CSSProperties = {
  margin: 0,
  fontFamily: "inherit",
  fontWeight: 400,
  fontSize: "1.4em",
  letterSpacing: "0.06em",
};
export const rail: CSSProperties = {
  borderLeft: `1px solid ${LINE}`,
  paddingLeft: 14,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};
export const rule: CSSProperties = {
  width: 120,
  height: 1,
  background: FILL_OFF,
};
export const link: CSSProperties = { cursor: "pointer" };

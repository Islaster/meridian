// The one place a color or a typeface is named. Everything else imports these.
export const SERIF =
  '"Palatino Linotype", "Book Antiqua", Palatino, "Cormorant Garamond", Georgia, serif';
export const INK = "rgba(233,236,242,0.92)"; // text
export const LINE = "rgba(233,236,242,0.28)"; // borders
export const LINE_FAINT = "rgba(233,236,242,0.1)";
export const FILL = "rgba(233,236,242,0.85)"; // a gauge's lit segment
export const FILL_OFF = "rgba(233,236,242,0.12)";
export const POOL = "rgba(226,196,140,0.85)"; // the class pool's bar
export const FOCUS = "rgba(200,212,255,0.7)"; // the targeted enemy's border
export const BLACK = "#000";
// type sizes, by how much reading a screen asks
export const FONT_BODY = `400 clamp(15px, 1.5vw, 19px) ${SERIF}`;
export const FONT_PANEL = `400 clamp(14px, 1.4vw, 18px) ${SERIF}`;
export const FONT_READ = `400 clamp(16px, 1.8vw, 22px) ${SERIF}`;
export const FONT_CARD = `400 clamp(15px, 1.6vw, 20px) ${SERIF}`;

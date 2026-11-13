import type { Grade } from "@/models/item";

// the grade ladder, readable at a glance: a name's color says what it is before you read it
export const GRADE_NAME: Record<Grade, string> = {
  inferiority: "inferior",
  normal: "normal",
  rare: "rare",
  unique: "unique",
  ancient: "ancient",
  legendary: "legendary",
  phantasm: "phantasm",
};
export const GRADE_COLOR: Record<Grade, string> = {
  inferiority: "rgba(233,236,242,0.45)", // worn grey
  normal: "inherit",
  rare: "#7fb2e5", // river blue
  unique: "#e2c48c", // old gold
  ancient: "#8fd0a0", // patina
  legendary: "#e59a5c", // ember
  phantasm: "#c79ae8", // violet
};
export const graded = (g: Grade | undefined) => ({
  color: GRADE_COLOR[g ?? "normal"],
});

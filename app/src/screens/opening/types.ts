// Shared types for the opening sequence.

export type PlateId =
  | "day"
  | "halfdark"
  | "night"
  | "converged"
  | "lightning"
  | "eruption"
  | "smoke"
  | "tsunami"
  | "tsunamiMotion"
  | "impact"
  | "aftermath";
export type Transition = "iris" | "cut" | "flash" | "none";
export type CueName =
  | "coast"
  | "gullsStop"
  | "wind"
  | "rumble"
  | "crack"
  | "eruption"
  | "smoke"
  | "wave"
  | "silence"
  | "title";
export type FxKind = "plate" | "pixel" | "draw";
export type FxName =
  | "drain"
  | "shimmer"
  | "lavaFlow"
  | "windowFlicker"
  | "gulls"
  | "chimney"
  | "embers"
  | "ash"
  | "starsIn"
  | "starsOut"
  | "seamDescent"
  | "seamBreathe"
  | "eruptionGlow"
  | "smokeDrift"
  | "silhouettes"
  | "smokeGlow"
  | "smokeFlash"
  | "dissolve"
  | "wave";

export interface FxParams {
  amp?: number;
  flee?: boolean;
  sparse?: boolean;
  startP?: number;
  radius?: number;
  plate?: PlateId;
  loop?: boolean;
  rate?: number;
  region?: { x0: number; y0: number; x1: number; y1: number }; // fractions of the plate
}
export type FxEntry = [FxName, FxParams?];

export interface Point {
  x: number;
  y: number;
}
export interface Layout {
  tip: Point;
  seamTop: number;
  horizon: number;
  town: { x0: number; x1: number; y0: number; y1: number };
  chimneys: Point[];
}

export interface CardShot {
  type: "card";
  text: string;
  dur: number;
}
export interface PlateShot {
  type: "plate";
  id: PlateId;
  base?: PlateId;
  dur: number;
  cam: [number, number];
  in: Transition;
  out: Transition;
  cue?: CueName;
  pan?: [Point, Point];
  rumble?: number;
  fx: FxEntry[];
  title?: { start: number; fade: number };
}
export type Shot = CardShot | PlateShot;
export type TimelineShot = Shot & { start: number; end: number };
export interface Timeline {
  list: TimelineShot[];
  total: number;
}
export interface ShotHit {
  shot: TimelineShot;
  t: number;
  p: number;
  done: boolean;
}

export interface FrameContext {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  t: number; // seconds into the shot
  p: number; // 0..1 through the shot
  T: number; // live seconds since start (keeps ambient loops moving after the end)
  shot: PlateShot & { start: number; end: number };
  L: Layout; // in native pixels
  memo: <V>(key: string, fn: () => V) => V;
  rng: (key: string) => () => number;
  drawPlate: (id: PlateId, alpha?: number) => void;
  plateData: (id: PlateId) => ImageData;
  img?: ImageData; // frame buffer, present for "pixel" fx
}

export interface FxDef {
  kind: FxKind;
  run: (f: FrameContext, params: FxParams) => void;
}

// Plates: loading, native-resolution downscale, and placeholders for missing plates.
import { mulberry32 } from "./timeline";
import type { Layout, PlateId } from "./types";

export const PLATE_IDS: PlateId[] = [
  "day",
  "halfdark",
  "night",
  "converged",
  "lightning",
  "eruption",
  "smoke",
  "tsunami",
  "tsunamiMotion",
  "impact",
  "aftermath",
];
export type PlateUrls = Partial<Record<PlateId, string>>;
export type PlateImages = Record<PlateId, HTMLImageElement | null>;

export function loadImage(url?: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function loadPlates(plates: PlateUrls = {}): Promise<PlateImages> {
  const out = {} as PlateImages;
  await Promise.all(
    PLATE_IDS.map(async (id) => {
      out[id] = await loadImage(plates[id]);
    })
  );
  return out;
}

// Native canvas = plate size / pixelScale. Auto: aim for ~480px wide.
export function nativeSize(
  images: PlateImages,
  pixelScale?: number
): { W: number; H: number } {
  const ref = PLATE_IDS.map((id) => images[id]).find(
    (i): i is HTMLImageElement => !!i
  );
  if (!ref) return { W: 480, H: 270 };
  const scale = pixelScale || Math.max(1, Math.round(ref.naturalWidth / 480));
  return {
    W: Math.round(ref.naturalWidth / scale),
    H: Math.round(ref.naturalHeight / scale),
  };
}

export function makeCanvas(W: number, H: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return c;
}

export function makeNativePlate(
  img: HTMLImageElement | null,
  id: PlateId,
  W: number,
  H: number,
  layout: Layout
): HTMLCanvasElement {
  const c = makeCanvas(W, H);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.imageSmoothingEnabled = false;
  if (img) ctx.drawImage(img, 0, 0, W, H);
  else drawPlaceholder(ctx, id, W, H, layout);
  return c;
}

/* ---------- placeholders: only used when a plate URL is missing ---------- */
interface Tint {
  sky: [string, string];
  mtn: string;
  sea: string;
  seaLight: string;
  town: string;
  win: string | null;
  lightning?: boolean;
  ember?: boolean;
  seabed?: boolean;
  ruin?: boolean;
}
const NIGHT: Tint = {
  sky: ["#0d1321", "#24304a"],
  mtn: "#0a0e18",
  sea: "#141c2e",
  seaLight: "#2a3a5c",
  town: "#171b27",
  win: "#ffb15c",
};
const TINTS: Record<PlateId, Tint> = {
  day: {
    sky: ["#8c97a8", "#b7bfcb"],
    mtn: "#3a4150",
    sea: "#5b6e8a",
    seaLight: "#8ea3c2",
    town: "#4b515d",
    win: null,
  },
  halfdark: {
    sky: ["#3b4459", "#5b6579"],
    mtn: "#1f2432",
    sea: "#2f3c55",
    seaLight: "#4b5f83",
    town: "#2c3141",
    win: "#ffb15c",
  },
  night: NIGHT,
  converged: NIGHT,
  lightning: { ...NIGHT, lightning: true },
  eruption: { ...NIGHT, win: null, ember: true },
  smoke: { ...NIGHT, sky: ["#04060b", "#0d1321"], win: null, ember: true },
  tsunami: { ...NIGHT, sky: ["#04060b", "#0d1321"], win: null, seabed: true },
  impact: { ...NIGHT, sky: ["#04060b", "#0d1321"], win: null },
  tsunamiMotion: { ...NIGHT, sky: ["#04060b", "#0d1321"], win: null },
  aftermath: {
    sky: ["#6b6f75", "#8a8d91"],
    mtn: "#3d4046",
    sea: "#4a4d52",
    seaLight: "#6a6d72",
    town: "#2f3237",
    win: null,
    ruin: true,
  },
};

export function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  id: PlateId,
  W: number,
  H: number,
  L: Layout
): void {
  const t = TINTS[id];
  const hz = Math.round(L.horizon * H);
  const tip = { x: L.tip.x * W, y: L.tip.y * H };
  const g = ctx.createLinearGradient(0, 0, 0, hz);
  g.addColorStop(0, t.sky[0]);
  g.addColorStop(1, t.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const pts: [number, number][] = [
    [0.34, L.horizon],
    [0.46, 0.55],
    [0.55, 0.44],
    [0.62, 0.38],
    [L.tip.x - 0.012, L.tip.y + 0.02],
    [L.tip.x - 0.006, L.tip.y],
    [L.tip.x, L.tip.y + 0.02],
    [L.tip.x + 0.006, L.tip.y],
    [L.tip.x + 0.012, L.tip.y + 0.02],
    [0.74, 0.44],
    [0.82, 0.52],
    [0.97, L.horizon],
  ];
  ctx.fillStyle = t.mtn;
  ctx.beginPath();
  pts.forEach(([x, y], i) =>
    i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H)
  );
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = t.sea;
  ctx.fillRect(0, hz, W, H - hz);
  if (t.seabed) {
    ctx.fillStyle = "#111418";
    ctx.fillRect(0, hz, Math.round(W * 0.5), H - hz);
  }
  const r = mulberry32(11);
  ctx.fillStyle = t.seaLight;
  for (let i = 0; i < Math.floor(W * H * 0.004); i++) {
    ctx.fillRect(
      Math.floor(r() * W),
      hz + 2 + Math.floor(r() * (H - hz - 3)),
      2,
      1
    );
  }

  const blocks: [number, number, number, number][] = [
    [0.02, 0.56, 0.07, 0.13],
    [0.1, 0.5, 0.06, 0.19],
    [0.17, 0.54, 0.09, 0.15],
    [0.27, 0.58, 0.06, 0.11],
    [0.33, 0.62, 0.05, 0.07],
  ];
  ctx.fillStyle = t.town;
  for (const [x, y, w, h] of blocks)
    ctx.fillRect(
      Math.round(x * W),
      Math.round(y * H),
      Math.round(w * W),
      Math.round(h * H)
    );
  if (t.win) {
    const r2 = mulberry32(5);
    ctx.fillStyle = t.win;
    for (const [x, y, w, h] of blocks)
      for (let k = 0; k < 4; k++)
        ctx.fillRect(
          Math.round((x + 0.01 + r2() * (w - 0.02)) * W),
          Math.round((y + 0.02 + r2() * (h - 0.04)) * H),
          1,
          1
        );
  }
  if (t.ruin) {
    ctx.fillStyle = t.sky[1];
    for (const [x, y, w, h] of blocks)
      ctx.fillRect(
        Math.round((x + w * 0.3) * W),
        Math.round(y * H),
        Math.round(w * 0.4 * W),
        Math.round(h * 0.3 * H)
      );
  }
  if (t.lightning) {
    ctx.strokeStyle = "#eef3ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tip.x, L.seamTop * H);
    ctx.lineTo(tip.x - 3, H * 0.18);
    ctx.lineTo(tip.x + 2, H * 0.26);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
  }
  if (t.ember) {
    ctx.fillStyle = "#ff7a2f";
    ctx.fillRect(Math.round(tip.x - 2), Math.round(tip.y), 4, 2);
    ctx.strokeStyle = "#ff7a2f";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(W * 0.6, H * 0.5);
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(W * 0.72, H * 0.48);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "8px monospace";
  ctx.fillText("placeholder: " + id, 4, H - 4);
}

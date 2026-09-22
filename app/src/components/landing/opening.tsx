// The opening sequence: living stills cut like a silent film.
// Plates animate on a small native canvas at the art's pixel resolution, then upscale nearest-neighbor.
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";
import { SHOTS, LAYOUT, TRANSITION } from "./config";
import {
  buildTimeline,
  shotAt,
  irisRadius,
  flashAlpha,
  clamp01,
  lerp,
  easeInOut,
  mulberry32,
  hashStr,
} from "./timeline";
import {
  loadPlates,
  nativeSize,
  makeNativePlate,
  makeCanvas,
  PLATE_IDS,
  type PlateUrls,
} from "./plates";
import { FX } from "./fx";
import { IntertitleCard, TitleOverlay, SERIF } from "./cards";
import type {
  CueName,
  FrameContext,
  Layout,
  PlateId,
  TimelineShot,
} from "./types";
import { VIEW } from "./config";

export interface OpeningProps {
  plates?: PlateUrls;
  /** File pixels per art pixel; auto-detected (≈480px-wide native) if omitted. */
  pixelScale?: number;
  /** Fires once, when the title has fully faded in. */
  onComplete?: () => void;
  /** Sound hooks: coast, gullsStop, wind, rumble, crack, eruption, smoke, wave, silence, title. */
  onCue?: (name: CueName) => void;
  showSkip?: boolean;
  /** Dev convenience. */
  showReplay?: boolean;
  seed?: number;
  children?: ReactNode; // the main menu; mounts when the title has fully faded in
  menuDelay?: number; // seconds after the title lands before the menu fades in
  menuTop?: string; // CSS top for the menu block
}

function irisMask(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  r: number
): void {
  const R = Math.max(0, r * Math.hypot(W, H) * 0.5);
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.arc(W / 2, H / 2, R, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
  ctx.restore();
}

export default function Opening({
  plates = {},
  pixelScale,
  onComplete = () => {},
  onCue = () => {},
  showSkip = true,
  showReplay = false,
  seed = 7,
  menuDelay = 1,
  menuTop = "52%",
  children,
}: OpeningProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef<() => void>(() => {});
  const [done, setDone] = useState(false);
  const [showUi, setShowUi] = useState(false);
  const [missing, setMissing] = useState<PlateId[]>([]);
  const [runId, setRunId] = useState(0);
  const [menuReady, setMenuReady] = useState(false);
  const [menuIn, setMenuIn] = useState(false);
  const platesKey = PLATE_IDS.map((id) => plates[id] ?? "").join("|");

  useEffect(() => {
    const canvas = canvasRef.current,
      wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dctx = canvas.getContext("2d");
    if (!dctx) return;
    let cancelled = false,
      raf = 0,
      start: number | null = null,
      doneFlag = false,
      completed = false;
    const timeline = buildTimeline(SHOTS);
    const reduce =
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const fired = new Set<string>();

    setDone(false);
    setShowUi(false);
    setMenuReady(false);
    setMenuIn(false);
    const uiTimer = window.setTimeout(() => setShowUi(true), 1500);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(wrap.clientWidth * dpr);
      canvas.height = Math.round(wrap.clientHeight * dpr);
      canvas.style.width = wrap.clientWidth + "px";
      canvas.style.height = wrap.clientHeight + "px";
    };

    finishRef.current = () => {
      doneFlag = true;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finishRef.current();
      }
    };
    window.addEventListener("keydown", onKey);

    (async () => {
      const imgs = await loadPlates(plates);
      if (cancelled) return;
      const { W, H } = nativeSize(imgs, pixelScale);
      setMissing(PLATE_IDS.filter((id) => !imgs[id]));
      const L: Layout = {
        tip: { x: LAYOUT.tip.x * W, y: LAYOUT.tip.y * H },
        seamTop: LAYOUT.seamTop * H,
        horizon: LAYOUT.horizon * H,
        town: {
          x0: LAYOUT.town.x0 * W,
          x1: LAYOUT.town.x1 * W,
          y0: LAYOUT.town.y0 * H,
          y1: LAYOUT.town.y1 * H,
        },
        chimneys: LAYOUT.chimneys.map((c) => ({ x: c.x * W, y: c.y * H })),
      };
      const plateCanvases = {} as Record<PlateId, HTMLCanvasElement>;
      for (const id of PLATE_IDS)
        plateCanvases[id] = makeNativePlate(imgs[id], id, W, H, LAYOUT);
      const plateData: Partial<Record<PlateId, ImageData>> = {};
      const native = makeCanvas(W, H);
      const nctx = native.getContext("2d");
      if (!nctx) return;
      nctx.imageSmoothingEnabled = false;

      let lastShot: TimelineShot | null = null;
      let memo = new Map<string, unknown>();

      const drawPlateWithCam = (
        id: PlateId,
        alpha: number,
        zoom: number,
        jit: { x: number; y: number }
      ) => {
        const sw = W / zoom,
          sh = H / zoom;
        nctx.globalAlpha = alpha;
        nctx.drawImage(
          plateCanvases[id],
          (W - sw) / 2 + jit.x,
          (H - sh) / 2 + jit.y,
          sw,
          sh,
          0,
          0,
          W,
          H
        );
        nctx.globalAlpha = 1;
      };

      const frame = (T: number, live: number): boolean => {
        const { shot, t, p, done: fin } = shotAt(timeline, T);
        if (shot !== lastShot) {
          memo = new Map();
          lastShot = shot;
          const key = String(shot.start);
          if (shot.type === "plate" && shot.cue && !fired.has(key)) {
            fired.add(key);
            onCue(shot.cue);
          }
        }
        // DOM overlays
        const cardEl = cardRef.current,
          titleEl = titleRef.current;
        if (cardEl) {
          if (shot.type === "card") {
            const span = cardEl.querySelector<HTMLSpanElement>("[data-text]");
            if (span && span.textContent !== shot.text)
              span.textContent = shot.text;
            cardEl.style.opacity = String(
              Math.min(
                clamp01(t / TRANSITION.card),
                clamp01((shot.dur - t) / TRANSITION.card)
              )
            );
          } else cardEl.style.opacity = "0";
        }
        let titleA = 0;
        if (shot.type === "plate" && shot.title) {
          titleA = clamp01((t - shot.title.start) / shot.title.fade);
          if (titleA > 0 && !fired.has("title")) {
            fired.add("title");
            onCue("title");
          }
        }
        if (fin) titleA = 1;
        if (titleA >= 1 && !fired.has("menu")) {
          fired.add("menu");
          setMenuReady(true);
        }
        if (titleEl) titleEl.style.opacity = String(titleA);

        // native frame
        nctx.fillStyle = "#000";
        nctx.fillRect(0, 0, W, H);
        if (shot.type === "plate") {
          const zoom = lerp(shot.cam[0], shot.cam[1], easeInOut(p));
          const jit = shot.rumble
            ? {
                x: Math.round(
                  (Math.sin(live * 53) + Math.sin(live * 31)) *
                    0.5 *
                    shot.rumble
                ),
                y: Math.round(Math.sin(live * 47) * 0.5 * shot.rumble),
              }
            : { x: 0, y: 0 };
          const f: FrameContext = {
            ctx: nctx,
            W,
            H,
            t,
            p,
            T: live,
            shot,
            L,
            memo: <V,>(k: string, fn: () => V): V => {
              if (!memo.has(k)) memo.set(k, fn());
              return memo.get(k) as V;
            },
            rng: (k: string) =>
              mulberry32(
                (seed * 7919 + hashStr(k) + Math.floor(shot.start * 1000)) | 0
              ),
            drawPlate: (id, alpha = 1) =>
              drawPlateWithCam(id, alpha, zoom, jit),
            plateData: (id) => {
              let d = plateData[id];
              if (!d) {
                const c = plateCanvases[id].getContext("2d");
                d = c ? c.getImageData(0, 0, W, H) : new ImageData(W, H);
                plateData[id] = d;
              }
              return d;
            },
          };
          drawPlateWithCam(shot.base ?? shot.id, 1, zoom, jit);
          const list = shot.fx.map(([name, params]) => ({
            def: FX[name],
            params: params ?? {},
          }));
          for (const e of list)
            if (e.def.kind === "plate") e.def.run(f, e.params);
          const pixel = list.filter((e) => e.def.kind === "pixel");
          if (pixel.length) {
            const img = nctx.getImageData(0, 0, W, H);
            f.img = img;
            for (const e of pixel) e.def.run(f, e.params);
            nctx.putImageData(img, 0, 0);
          }
          for (const e of list)
            if (e.def.kind === "draw") e.def.run(f, e.params);
          const r = irisRadius(shot, t, TRANSITION.iris);
          if (r < 1) irisMask(nctx, W, H, r);
          const fl = flashAlpha(shot, t, TRANSITION.flash);
          if (fl > 0) {
            nctx.fillStyle = `rgba(238,243,255,${fl.toFixed(3)})`;
            nctx.fillRect(0, 0, W, H);
          }
        }

        // the window: smaller than the plate, moved by whole art pixels — the image slides through it
        const vw = Math.round(W * VIEW.overscan),
          vh = Math.round(H * VIEW.overscan);
        const pn =
          shot.type === "plate" && shot.pan
            ? {
                x: lerp(shot.pan[0].x, shot.pan[1].x, easeInOut(p)),
                y: lerp(shot.pan[0].y, shot.pan[1].y, easeInOut(p)),
              }
            : { x: 0.5, y: 0.5 };
        const vx = Math.round((W - vw) * pn.x),
          vy = Math.round((H - vh) * pn.y);
        dctx.imageSmoothingEnabled = false;
        dctx.fillStyle = "#000";
        dctx.fillRect(0, 0, canvas.width, canvas.height);
        const s = Math.min(canvas.width / vw, canvas.height / vh);
        const scale = s >= 1 ? Math.floor(s) : s;
        const dw = Math.round(vw * scale),
          dh = Math.round(vh * scale);
        dctx.drawImage(
          native,
          vx,
          vy,
          vw,
          vh,
          Math.round((canvas.width - dw) / 2),
          Math.round((canvas.height - dh) / 2),
          dw,
          dh
        );
        return fin;
      };

      const loop = (now: number) => {
        if (cancelled) return;
        if (start === null) start = now;
        const live = (now - start) / 1000;
        const T = reduce || doneFlag ? timeline.total : live;
        const fin = frame(T, live);
        if (fin && !completed) {
          completed = true;
          setDone(true);
          onComplete();
        }
        raf = requestAnimationFrame(loop); // keeps ash falling under the menu
      };

      resize();
      window.addEventListener("resize", resize);
      raf = requestAnimationFrame(loop);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(uiTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, platesKey, pixelScale, seed]);

  useEffect(() => {
    if (!menuReady) {
      setMenuIn(false);
      return;
    }
    const id = window.setTimeout(() => setMenuIn(true), menuDelay * 1000);
    return () => window.clearTimeout(id);
  }, [menuReady, menuDelay]);

  const skip = useCallback(() => finishRef.current(), []);
  const replay = () => setRunId((r) => r + 1);

  const btn: CSSProperties = {
    position: "absolute",
    font: `13px ${SERIF}`,
    letterSpacing: "0.06em",
    color: "rgba(233,236,242,0.6)",
    background: "transparent",
    border: "1px solid rgba(233,236,242,0.28)",
    borderRadius: 2,
    padding: "7px 16px",
    cursor: "pointer",
    transition: "opacity 600ms ease",
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Meridian opening sequence"
        role="img"
        style={{ display: "block" }}
      />
      <IntertitleCard ref={cardRef} />
      <TitleOverlay ref={titleRef} />
      {children && menuReady && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: menuTop,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: menuIn ? 1 : 0,
            transition: "opacity 1400ms ease",
            pointerEvents: menuIn ? "auto" : "none",
          }}
        >
          {children}
        </div>
      )}
      {missing.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 12,
            font: `11px ${SERIF}`,
            color: "rgba(233,236,242,0.45)",
            letterSpacing: "0.04em",
          }}
        >
          Placeholder plates: {missing.join(", ")}
        </div>
      )}
      {showSkip && !done && (
        <button
          onClick={skip}
          style={{ ...btn, right: 28, bottom: 24, opacity: showUi ? 1 : 0 }}
        >
          Skip
        </button>
      )}
      {showReplay && done && (
        <button
          onClick={replay}
          style={{
            ...btn,
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 24,
          }}
        >
          Play again
        </button>
      )}
    </div>
  );
}

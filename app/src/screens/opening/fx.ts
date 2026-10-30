// FX registry. kind: "plate" draws extra plates under everything,
// "pixel" edits the frame buffer (batched into one pass), "draw" paints overlays.
import type { FxDef, FxName } from "./types";
import * as particles from "./particles";
import * as light from "./light";
import * as cycle from "./pixelCycle";
import * as weather from "./weather";

export const FX: Record<FxName, FxDef> = {
  drain: { kind: "plate", run: weather.drain },

  shimmer: { kind: "pixel", run: cycle.shimmer },
  lavaFlow: { kind: "pixel", run: cycle.lavaFlow },
  windowFlicker: { kind: "pixel", run: cycle.windowFlicker },
  smokeGlow: { kind: "pixel", run: cycle.smokeGlow },
  smokeFlash: { kind: "pixel", run: cycle.smokeFlash },

  gulls: { kind: "draw", run: particles.gulls },
  chimney: { kind: "draw", run: particles.chimney },
  embers: { kind: "draw", run: particles.embers },
  ash: { kind: "draw", run: particles.ash },
  starsIn: { kind: "draw", run: light.starsIn },
  starsOut: { kind: "draw", run: light.starsOut },
  seamDescent: { kind: "draw", run: light.seamDescent },
  seamBreathe: { kind: "draw", run: light.seamBreathe },
  eruptionGlow: { kind: "draw", run: light.eruptionGlow },
  smokeDrift: { kind: "draw", run: weather.smokeDrift },
  silhouettes: { kind: "draw", run: weather.silhouettes },
  wave: { kind: "draw", run: weather.wave },
  dissolve: { kind: "pixel", run: cycle.dissolve },
};

import type { FlyerBrand } from "@/lib/flyer-brands";
import type { EventVariant, FlyerBackground, FlyerHidden, FlyerKind, InfographicVariant, SponsorLogo, VenueData } from "@/lib/flyer-kinds";
import type { Direction, TransitionId } from "@/lib/story-transitions";

/** What a panel shows. Each option maps to one flyer kind and variant. */
export const CONTENT_OPTIONS = {
  evento: { label: "Evento principal", kind: "event", variant: "principal", infoVariant: "tarjetas" },
  recordatorio: { label: "Recordatorio", kind: "event", variant: "recordatorio", infoVariant: "tarjetas" },
  "ultimos-lugares": { label: "Últimos lugares", kind: "event", variant: "ultimos-lugares", infoVariant: "tarjetas" },
  "dia-d": { label: "Día D", kind: "event", variant: "dia-d", infoVariant: "tarjetas" },
  "save-the-date": { label: "Save the date", kind: "teaser", variant: "principal", infoVariant: "tarjetas" },
  cuenta: { label: "Cuenta regresiva", kind: "countdown", variant: "principal", infoVariant: "tarjetas" },
  "info-tarjetas": { label: "Infografía · tarjetas", kind: "infographic", variant: "principal", infoVariant: "tarjetas" },
  "info-cronograma": { label: "Infografía · cronograma", kind: "infographic", variant: "principal", infoVariant: "cronograma" },
  "info-cupos": { label: "Infografía · cupos", kind: "infographic", variant: "principal", infoVariant: "cupos" },
} as const satisfies Record<string, { label: string; kind: FlyerKind; variant: EventVariant; infoVariant: InfographicVariant }>;
export type ContentId = keyof typeof CONTENT_OPTIONS;

/** How each block of the flyer enters on screen. */
export const ENTRANCES = {
  ninguna: { label: "Ninguna" },
  subir: { label: "Subir" },
  crecer: { label: "Crecer" },
  girar: { label: "Girar" },
  deslizar: { label: "Deslizar" },
} as const;
export type EntranceId = keyof typeof ENTRANCES;

/** How the blocks of a panel appear over time. "escribir" types them out, like someone presenting. */
export const REVEALS = {
  todo: { label: "Todo a la vez", hint: "Todos los bloques entran juntos" },
  uno: { label: "Uno por uno", hint: "Cada bloque entra después del anterior, como al presentar" },
  escribir: { label: "Escribiendo", hint: "Los bloques se escriben letra por letra, en orden" },
} as const;
export type RevealId = keyof typeof REVEALS;

/** Effects laid over the whole video. Each one is drawn from the playback clock, so it stays in sync. */
export const EFFECTS = {
  paralaje: { label: "Paralaje", hint: "El fondo se mueve a otra velocidad que el contenido, como en /jam" },
  zoom: { label: "Zoom lento", hint: "El panel se acerca mientras está en pantalla" },
  sacudida: { label: "Sacudida", hint: "Tiembla un instante en cada corte" },
  destello: { label: "Destello", hint: "Flash blanco en cada corte" },
  particulas: { label: "Partículas", hint: "Chispas de color que suben" },
  vineta: { label: "Viñeta", hint: "Bordes oscuros para enfocar el centro" },
  scanlines: { label: "Scanlines", hint: "Líneas de CRT encima de todo" },
  grano: { label: "Grano", hint: "Ruido de película que se mueve" },
} as const;
export type EffectId = keyof typeof EFFECTS;

/** A transition set on its own, in advanced mode. It runs between the previous panel and this one. */
export interface TransitionFx {
  type: TransitionId;
  direction?: Direction;
  strength: number;
}

/** Text shown on one panel. A key that is unset keeps the brand default. Empty string clears the line. */
export interface PanelText {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  dateText?: string;
  city?: string;
  /** Full venue override for this panel (MiradorTEC, free text, or uploaded logo). */
  venue?: VenueData;
}

export interface StoryPanel {
  id: string;
  content: ContentId;
  /** Per-panel copy. Overrides the brand defaults for the fields it sets. */
  text?: PanelText;
  /** Components hidden on this panel (eye toggles). Unset means everything shows. */
  hidden?: FlyerHidden;
  durationMs: number;
  /** Length of the transition that brings this panel in. */
  transitionMs: number;
  /** Transition into this panel, used only in advanced mode. Unset means the global transition. */
  transitionFx?: TransitionFx;
  entrance: EntranceId;
  reveal: RevealId;
  /** Gap between one block and the next when reveal is "uno" or "escribir". */
  revealStepMs: number;
  /** Effects that play while this panel is on screen. Transitions blend the effects of both panels. */
  effects: EffectId[];
  /** Background for this panel. Unset means the brand's default background. */
  background?: FlyerBackground;
}

export interface StoryConfig {
  brand: FlyerBrand;
  panels: StoryPanel[];
  /** Event logo shown on every panel. Unset means each panel's brand logo. */
  eventLogo?: string;
  /** Sponsor logos shown on every panel. Unset means each panel's brand sponsors. */
  sponsors?: SponsorLogo[];
  transition: TransitionId;
  /** When on, each transition is set between its two panels (`panel.transitionFx`) instead of `transition`. */
  advancedTransitions: boolean;
  /** When on, the sequence repeats until `repeatUntilMs`. */
  repeat: boolean;
  repeatUntilMs: number;
  /** When on, the last panel holds on screen for `holdMs` after the sequence (or loop) ends. */
  holdLast: boolean;
  holdMs: number;
  /** Snap panel cuts to detected beats, when a track is loaded. */
  snapToBeats: boolean;
  /**
   * Where the music sits on the timeline, in ms. Positive: the timeline starts that far into the
   * track. Negative: the music starts that long after the timeline starts.
   */
  musicOffsetMs: number;
}

export interface Segment {
  panel: StoryPanel;
  /** Index of the panel in config.panels, so the same panel can repeat. */
  panelIndex: number;
  start: number;
  end: number;
  /** Transition that runs during the first `transitionMs` of this segment. */
  transition: TransitionId;
  transitionMs: number;
  direction?: Direction;
  strength: number;
}

export interface Timeline {
  segments: Segment[];
  total: number;
}

export const MIN_PANEL_MS = 300;
const SNAP_WINDOW = 0.4;

/** Panel ids only need to be unique inside the editor. crypto.randomUUID is missing on plain-http LAN hosts. */
function panelId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function newPanel(content: ContentId = "evento"): StoryPanel {
  return {
    id: panelId(),
    content,
    durationMs: 3000,
    transitionMs: 500,
    entrance: "subir",
    reveal: "uno",
    revealStepMs: 350,
    effects: [],
  };
}

export const DEFAULT_STORY: StoryConfig = {
  brand: "gamer",
  panels: [
    { ...newPanel("evento"), id: "p1", effects: ["paralaje", "destello"] },
    { ...newPanel("info-tarjetas"), id: "p2", entrance: "crecer", reveal: "uno", effects: ["paralaje"] },
    { ...newPanel("info-cronograma"), id: "p3", entrance: "deslizar", reveal: "escribir", effects: ["paralaje"] },
    { ...newPanel("cuenta"), id: "p4", entrance: "girar", reveal: "todo", durationMs: 3500, effects: ["paralaje", "particulas"] },
  ],
  transition: "slide",
  advancedTransitions: false,
  repeat: false,
  repeatUntilMs: 30000,
  holdLast: false,
  holdMs: 3000,
  snapToBeats: true,
  // The default track starts 44.5 s into the song.
  musicOffsetMs: 44500,
};

/** Nearest beat to `ms`, or null when none is close enough to snap to. */
function snapTo(beats: number[], ms: number, tolerance: number): number | null {
  let best: number | null = null;
  for (const b of beats) {
    const d = Math.abs(b * 1000 - ms);
    if (d <= tolerance && (best === null || d < Math.abs(best * 1000 - ms))) best = b;
  }
  return best === null ? null : best * 1000;
}

/**
 * Lays the panels out on a timeline. The sequence repeats when `repeat` is on, up to
 * `repeatUntilMs`. Each panel's cut point is snapped to a beat when the track has one nearby.
 */
export function buildTimeline(config: StoryConfig, beats: number[] = []): Timeline {
  const segments: Segment[] = [];
  if (config.panels.length === 0) return { segments, total: 0 };
  const limit = config.repeat ? Math.max(MIN_PANEL_MS, config.repeatUntilMs) : Infinity;
  let cursor = 0;
  let guard = 0;

  while (cursor < limit && guard++ < 500) {
    for (const [panelIndex, panel] of config.panels.entries()) {
      if (cursor >= limit) break;
      const start = cursor;
      let dur = Math.max(MIN_PANEL_MS, panel.durationMs);
      if (config.snapToBeats && beats.length > 0) {
        const snapped = snapTo(beats, start + dur, dur * SNAP_WINDOW);
        if (snapped !== null && snapped - start >= MIN_PANEL_MS) dur = snapped - start;
      }
      const end = Math.min(start + dur, limit);
      const first = segments.length === 0;
      const fx = config.advancedTransitions ? panel.transitionFx : undefined;
      const transition: TransitionId = first ? "cut" : fx ? fx.type : config.transition;
      segments.push({
        panel,
        panelIndex,
        start,
        end,
        transition,
        transitionMs: transition === "cut" ? 0 : Math.min(panel.transitionMs, (end - start) / 2),
        direction: fx?.direction,
        strength: fx?.strength ?? 1,
      });
      cursor = end;
    }
    if (!config.repeat) break;
  }

  // The last panel stays on screen for the hold. Its end moves, so frameAt needs no change.
  const last = segments[segments.length - 1];
  if (config.holdLast && config.holdMs > 0 && last) {
    last.end += config.holdMs;
    cursor = last.end;
  }

  return { segments, total: cursor };
}

export interface Frame {
  /** Index into timeline.segments of the panel on screen. */
  current: number;
  /** Index of the panel that is leaving during a transition, or null. */
  prev: number | null;
  /** Eased transition progress (0 when prev is null). */
  e: number;
  /** ms since the current panel started. */
  local: number;
  /** ms since the previous panel started. */
  prevLocal: number;
}

function ease(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/** Which panel is on screen at time t, and whether a transition is running into it. */
export function frameAt(t: number, timeline: Timeline): Frame {
  const { segments } = timeline;
  let idx = 0;
  for (let i = 0; i < segments.length; i++) {
    if (t >= segments[i].start) idx = i;
  }
  const seg = segments[idx];
  const local = Math.max(0, t - seg.start);
  if (idx > 0 && seg.transitionMs > 0 && local < seg.transitionMs) {
    return {
      current: idx,
      prev: idx - 1,
      e: ease(local / seg.transitionMs),
      local,
      prevLocal: t - segments[idx - 1].start,
    };
  }
  return { current: idx, prev: null, e: 0, local, prevLocal: 0 };
}

import type { CSSProperties } from "react";

/**
 * Transitions between story panels. Each one maps eased progress (0 → 1) to styles for the
 * outgoing (prev) and incoming (next) panel.
 *
 * Two rows, because they behave differently:
 * - Classic: the usual hard cut, fade, slide, wipe, zoom punch and flip. These are mostly
 *   sequential, one panel leaves before or as the other arrives.
 * - Overlay: the panels truly overlap for the whole transition. The incoming panel is drawn
 *   above the outgoing one, which stays visible underneath (or fades through it).
 */
export const CLASSIC_TRANSITIONS = {
  cut: { label: "Corte", hint: "Corte seco en el beat" },
  fade: { label: "Fundido", hint: "Cruce de opacidad" },
  slide: { label: "Deslizar", hint: "La nueva entra empujando a la anterior" },
  wipe: { label: "Barrido", hint: "Revela la nueva en una dirección" },
  zoom: { label: "Zoom", hint: "Golpe de zoom al cambiar" },
  flip: { label: "Giro", hint: "Gira la tarjeta en 3D" },
} as const;

export const OVERLAY_TRANSITIONS = {
  overSlide: { label: "Cubrir", hint: "La nueva sube por encima; la anterior queda quieta debajo" },
  iris: { label: "Iris", hint: "Un círculo se abre desde el centro sobre la anterior" },
  boxOpen: { label: "Caja", hint: "Un rectángulo crece desde el centro sobre la anterior" },
  blur: { label: "Desenfoque", hint: "La anterior se desenfoca mientras la nueva enfoca encima" },
  zoomThrough: { label: "Atravesar", hint: "La anterior crece hacia la cámara y se disuelve; la nueva aparece detrás" },
  glitch: { label: "Glitch", hint: "Bandas horizontales que se abren con saltos" },
} as const;

export const TRANSITIONS = { ...CLASSIC_TRANSITIONS, ...OVERLAY_TRANSITIONS } as const;

export type ClassicTransitionId = keyof typeof CLASSIC_TRANSITIONS;
export type OverlayTransitionId = keyof typeof OVERLAY_TRANSITIONS;
export type TransitionId = keyof typeof TRANSITIONS;

/** Where the incoming panel comes from. Used by slide, overSlide and wipe. */
export const DIRECTIONS = {
  izquierda: { label: "Izquierda" },
  derecha: { label: "Derecha" },
  arriba: { label: "Arriba" },
  abajo: { label: "Abajo" },
} as const;
export type Direction = keyof typeof DIRECTIONS;

/** Transitions whose look depends on a direction. */
export const DIRECTIONAL: ReadonlySet<TransitionId> = new Set<TransitionId>(["slide", "overSlide", "wipe"]);
/** Transitions whose strength (0.5 → 2) scales their amount of motion. */
export const STRENGTH_TRANSITIONS: ReadonlySet<TransitionId> = new Set<TransitionId>(["zoom", "blur", "zoomThrough", "glitch"]);

/** Unit vector the incoming panel travels from. */
const FROM: Record<Direction, { x: number; y: number }> = {
  izquierda: { x: -1, y: 0 },
  derecha: { x: 1, y: 0 },
  arriba: { x: 0, y: -1 },
  abajo: { x: 0, y: 1 },
};

/** Direction used when a transition has none set. Wipes reveal from the left, the rest come from the right. */
export function defaultDirection(id: TransitionId): Direction {
  return id === "wipe" ? "izquierda" : "derecha";
}

export interface TransitionOptions {
  direction?: Direction;
  /** Multiplier on the amount of motion. 1 is the standard look. */
  strength?: number;
}

export interface TransitionStyles {
  prev: CSSProperties;
  next: CSSProperties;
  /** Applied to the whole stage, for effects that need perspective. */
  stage: CSSProperties;
}

/** Styles for the outgoing and incoming panel at eased progress e (0 → 1). */
export function transitionStyles(id: TransitionId, e: number, opts: TransitionOptions = {}): TransitionStyles {
  const dir = opts.direction ?? defaultDirection(id);
  const from = FROM[dir];
  const s = opts.strength ?? 1;
  const r = (1 - e) * 100;

  switch (id) {
    // Classic row
    case "fade":
      return { prev: { opacity: 1 - e }, next: { opacity: e }, stage: {} };
    case "slide":
      return {
        prev: { transform: `translate(${-from.x * e * 100}%, ${-from.y * e * 100}%)` },
        next: { transform: `translate(${from.x * r}%, ${from.y * r}%)` },
        stage: {},
      };
    case "wipe": {
      const clip =
        dir === "izquierda" ? `inset(0 ${r}% 0 0)`
        : dir === "derecha" ? `inset(0 0 0 ${r}%)`
        : dir === "arriba" ? `inset(${r}% 0 0 0)`
        : `inset(0 0 ${r}% 0)`;
      return { prev: {}, next: { clipPath: clip }, stage: {} };
    }
    case "zoom":
      return {
        prev: { transform: `scale(${1 + 0.12 * s * e})`, opacity: 1 - e },
        next: { transform: `scale(${1 + 0.12 * s * (1 - e)})`, opacity: e },
        stage: {},
      };
    case "flip":
      return {
        prev: { transform: `rotateY(${-90 * e}deg)`, backfaceVisibility: "hidden" },
        next: { transform: `rotateY(${90 * (1 - e)}deg)`, backfaceVisibility: "hidden" },
        stage: { perspective: 1800 },
      };

    // Overlay row: both panels are on screen for the whole transition.
    case "overSlide":
      return {
        prev: {},
        next: {
          transform: `translate(${from.x * r}%, ${from.y * r}%)`,
          boxShadow: e < 1 ? `${-from.x * 30}px ${-from.y * 30}px 70px rgba(0,0,0,0.55)` : "none",
        },
        stage: {},
      };
    case "iris":
      return { prev: {}, next: { clipPath: `circle(${e * 75}% at 50% 50%)` }, stage: {} };
    case "boxOpen": {
      const inset = (1 - e) * 50;
      return { prev: {}, next: { clipPath: `inset(${inset}% ${inset}% ${inset}% ${inset}%)` }, stage: {} };
    }
    case "blur":
      return {
        prev: { filter: `blur(${e * 24 * s}px)`, opacity: 1 - e * 0.6 },
        next: { filter: `blur(${(1 - e) * 24 * s}px)`, opacity: e },
        stage: {},
      };
    case "zoomThrough":
      return {
        prev: { transform: `scale(${1 + 1.2 * s * e})`, opacity: 1 - e },
        next: { transform: `scale(${0.7 + 0.3 * e})`, opacity: e },
        stage: {},
      };
    case "glitch": {
      const band = r * 0.45;
      return {
        prev: { transform: `translateX(${Math.cos(e * 23) * (1 - e) * -30 * s}px)` },
        next: {
          clipPath: `inset(${band}% 0 ${band}% 0)`,
          transform: `translateX(${Math.sin(e * 31) * (1 - e) * 40 * s}px)`,
          opacity: e < 0.2 ? 0 : 1,
        },
        stage: {},
      };
    }
    case "cut":
    default:
      return { prev: {}, next: {}, stage: {} };
  }
}

/** True when the transition keeps the outgoing panel drawn while the incoming one arrives. */
export function isOverlay(id: TransitionId): id is OverlayTransitionId {
  return id in OVERLAY_TRANSITIONS;
}

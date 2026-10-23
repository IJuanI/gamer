"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import type { EffectId, EntranceId, RevealId } from "@/lib/story-model";

/**
 * Motion state for one panel of the video. The flyer reads it through context, so the same
 * components render static when there is no context (PNG export and the admin preview).
 */
export interface StoryMotion {
  /** ms since this panel started on screen. */
  local: number;
  entrance: EntranceId;
  reveal: RevealId;
  /** Gap between blocks for "uno" and "escribir". */
  stepMs: number;
  effects: EffectId[];
}

export const StoryMotionContext = createContext<StoryMotion | null>(null);

export function useStoryMotion(): StoryMotion | null {
  return useContext(StoryMotionContext);
}

const ENTER_MS = 650;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function easeOut(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

/**
 * Inline style for block number `order` inside a panel. Before its start time the block is
 * invisible, so it can be laid out at full size without shifting the rest of the flyer.
 */
export function revealStyle(m: StoryMotion | null, order: number, u = 1): CSSProperties {
  if (!m) return {};

  if (m.reveal === "escribir") {
    const start = order * m.stepMs;
    const dur = Math.max(m.stepMs, 200) * 1.5;
    const e = easeOut(clamp01((m.local - start) / dur));
    return { clipPath: `inset(0 ${(1 - e) * 100}% 0 0)`, opacity: e > 0 ? 1 : 0 };
  }

  const start = m.reveal === "todo" ? 0 : order * m.stepMs;
  const e = easeOut(clamp01((m.local - start) / ENTER_MS));
  const inv = 1 - e;
  const opacity = e;

  switch (m.entrance) {
    case "subir":
      return { opacity, transform: `translateY(${inv * 60 * u}px)` };
    case "crecer":
      return { opacity, transform: `scale(${0.55 + 0.45 * e})` };
    case "girar":
      return { opacity, transform: `rotate(${inv * -14}deg) scale(${0.8 + 0.2 * e})` };
    case "deslizar":
      return { opacity, transform: `translateX(${inv * -90 * u}px)` };
    default:
      return { opacity };
  }
}

/**
 * Wraps one block of a flyer so it can enter on its own. Without motion context it returns the
 * children untouched, so static flyers are unchanged.
 */
export function Reveal({ order, children, u = 1 }: { order: number; children: ReactNode; u?: number }) {
  const m = useStoryMotion();
  if (!m) return <>{children}</>;
  return <div style={revealStyle(m, order, u)}>{children}</div>;
}

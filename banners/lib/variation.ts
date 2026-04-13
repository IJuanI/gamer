export type IconName = "gamepad" | "gem" | "crosshair" | "shield" | "sword" | "alien";

export interface BannerVariation {
  /** Which icon renders in each of the 3 decorative background slots */
  icons: readonly [IconName, IconName, IconName];
  /** Degrees added to each icon slot's base rotation */
  rotationOffsets: readonly [number, number, number];
  /**
   * Normalized position seeds [0–1] per slot.
   * Each banner component maps these to its own coordinate ranges,
   * so icons roam their full valid zone rather than jittering from a fixed point.
   */
  positionSeeds: readonly [number, number, number];
  /**
   * Normalized seeds [0–1] for the geometric decorator layer.
   * d1 = top-right ring cluster + dot
   * d2 = bottom-left ring cluster + dot
   * d3 = trapezoid sizes / vertical offsets
   * Each component maps these to its own coordinate ranges.
   */
  decoratorSeeds: readonly [number, number, number];
  /** Added to diagonal clip % on gradient blocks (negative = shallower, positive = steeper) */
  clipVariance: number;
}

// Curated sets — each combination looks balanced at the positions used in the banners
const ICON_SETS: readonly [IconName, IconName, IconName][] = [
  ["gamepad", "gem", "alien"],
  ["crosshair", "shield", "sword"],
  ["gamepad", "crosshair", "gem"],
  ["shield", "gem", "alien"],
  ["sword", "crosshair", "gamepad"],
  ["alien", "sword", "gem"],
  ["crosshair", "gamepad", "shield"],
] as const;

export const DEFAULT_VARIATION: BannerVariation = {
  icons: ["gamepad", "gem", "alien"],
  rotationOffsets: [0, 0, 0],
  positionSeeds: [0.5, 0.5, 0.5],
  decoratorSeeds: [0.5, 0.5, 0.5],
  clipVariance: 0,
};

function ri(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateVariation(): BannerVariation {
  return {
    icons: ICON_SETS[Math.floor(Math.random() * ICON_SETS.length)],
    rotationOffsets: [ri(-20, 20), ri(-20, 20), ri(-15, 15)],
    positionSeeds: [Math.random(), Math.random(), Math.random()],
    decoratorSeeds: [Math.random(), Math.random(), Math.random()],
    clipVariance: ri(-8, 8),
  };
}

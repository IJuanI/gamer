/**
 * Brand tokens for the admin flyer generator.
 * Colors are taken from each brand's source site / tokens:
 * - jam: /jam page palette (components/flyers/jam-flyer.tsx)
 * - gamedevs: lib/gamedevs-tokens.ts (approved palette only)
 * - gamer: docs/brand.md + root CLAUDE.md (approved palette only)
 */

export type FlyerBrand = "jam" | "gamedevs" | "gamer";

export interface FlyerBrandTokens {
  id: FlyerBrand;
  name: string;
  bg: string;
  grid: string;
  accent: string;
  accentAlt: string;
  text: string;
  muted: string;
  /** Colour for the big title. Defaults to text when unset. */
  titleColor?: string;
  /** Font family for the big title. GamER and GameDevs headlines are AZONIX, matching their landing pages. */
  titleFont: "azonix" | "sans";
  logo: string;
  logoAlt: string;
  /** Optional image used in place of the text title (jam uses its wordmark). */
  titleImage?: string;
}

export const FLYER_BRANDS: Record<FlyerBrand, FlyerBrandTokens> = {
  gamer: {
    id: "gamer",
    name: "GamER",
    bg: "#0a0a12",
    grid: "rgba(179,57,196,0.1)",
    accent: "#B339C4",
    accentAlt: "#84C552",
    text: "#ffffff",
    muted: "#c4bccf",
    titleFont: "azonix",
    logo: "/logo.png",
    logoAlt: "GamER",
  },
  gamedevs: {
    id: "gamedevs",
    name: "GameDevs",
    bg: "#000000",
    grid: "rgba(114,179,65,0.06)",
    accent: "#72b341",
    accentAlt: "#619f2f",
    text: "#ffffff",
    muted: "#a8a8a8",
    titleColor: "#72b341",
    titleFont: "azonix",
    logo: "/gamedevs-icon.svg",
    logoAlt: "GameDevs",
  },
  jam: {
    id: "jam",
    name: "Paraná Game Jam",
    bg: "#0b1020",
    grid: "rgba(60,255,158,0.08)",
    accent: "#3cff9e",
    accentAlt: "#8b6cff",
    text: "#ffffff",
    muted: "#b6c2ff",
    titleFont: "sans",
    logo: "/gamejamplus-logo.png",
    logoAlt: "Game Jam Plus",
    titleImage: "/jam/pgj-logo.png",
  },
};

export const FLYER_BRAND_LIST = Object.values(FLYER_BRANDS);

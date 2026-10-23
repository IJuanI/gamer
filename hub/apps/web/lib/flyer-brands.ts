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
  /** Font family for the big title. GamER headlines are AZONIX per brand rules. */
  titleFont: "azonix" | "sans";
  logo: string;
  logoAlt: string;
  /** Optional image used in place of the text title (jam uses its wordmark). */
  titleImage?: string;
}

export const FLYER_BRANDS: Record<FlyerBrand, FlyerBrandTokens> = {
  jam: {
    id: "jam",
    name: "Paraná Game Jam",
    bg: "#0b1020",
    grid: "rgba(60,255,158,0.3)",
    accent: "#3cff9e",
    accentAlt: "#8b6cff",
    text: "#ffffff",
    muted: "#b6c2ff",
    titleFont: "sans",
    logo: "/gamejamplus-logo.png",
    logoAlt: "Game Jam Plus",
    titleImage: "/jam/pgj-logo.png",
  },
  gamedevs: {
    id: "gamedevs",
    name: "GameDevs",
    bg: "#000000",
    grid: "rgba(114,179,65,0.22)",
    accent: "#72b341",
    accentAlt: "#619f2f",
    text: "#ffffff",
    muted: "#808080",
    titleFont: "sans",
    logo: "/gamedevs-icon.svg",
    logoAlt: "GameDevs",
  },
  gamer: {
    id: "gamer",
    name: "GamER",
    bg: "#0a0a12",
    grid: "rgba(179,57,196,0.18)",
    accent: "#B339C4",
    accentAlt: "#84C552",
    text: "#ffffff",
    muted: "#9E46AE",
    titleFont: "azonix",
    logo: "/logo.png",
    logoAlt: "GamER",
  },
};

export const FLYER_BRAND_LIST = Object.values(FLYER_BRANDS);

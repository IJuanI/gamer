/** Editable flyer copy for the /jam event flyer, sourced from app/jam/page.tsx. */

export interface JamFlyerData {
  eyebrow: string;
  /** Three-part title split to match the site's per-word color treatment. */
  titleParts: { text: string; color: "green" | "purple" | "white" }[];
  heroText: string;
  dateRange: string;
  venue: string;
  city: string;
}

export const JAM_FLYER_DATA: JamFlyerData = {
  eyebrow: "Game Jam Plus 2026",
  titleParts: [
    { text: "Paraná", color: "green" },
    { text: "Game", color: "purple" },
    { text: "Jam", color: "white" },
  ],
  heroText: "Torneo de desarrollo de Videojuegos. Crea, colabora e innova.",
  dateRange: "16 AL 18 DE OCTUBRE",
  venue: "MiradorTEC",
  city: "Paraná, Entre Ríos",
};

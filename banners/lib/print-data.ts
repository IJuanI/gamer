import type { ScheduleItem } from "@/components/print/cronograma";
import type { MenuCategory } from "@/components/print/menu-gastronomico";
import type { CredentialAccent } from "@/components/print/staff-credential";

export interface CredentialEntry {
  id: string;
  name: string;
  accent: CredentialAccent;
}

/** Default event name shown on credentials. */
export const DEFAULT_CREDENTIAL_EVENT = "Open Duo";

/** Starter set of credentials — empty names print a write-on line. */
export const DEFAULT_CREDENTIALS: CredentialEntry[] = [
  { id: "cred-1", name: "", accent: "purple" },
  { id: "cred-2", name: "", accent: "green" },
  { id: "cred-3", name: "", accent: "pink" },
];

/** Default Open-Duo schedule (15hs inicio → 21hs cierre). */
export const OPEN_DUO_SCHEDULE: ScheduleItem[] = [
  { time: "15:00", label: "Inicio del evento", accent: "purple" },
  { time: "16:00", label: "Torneo League of Legends", accent: "purple" },
  { time: "18:30", label: "Torneo Counter-Strike 2", accent: "green" },
  { time: "21:00", label: "Cierre", accent: "orange" },
];

/** Default URLs / handles for the QR signs. Edit per event in the UI. */
export const DEFAULT_DISCORD_URL = "https://discord.gg/Sq9TEAGwyd";
export const DEFAULT_INSTAGRAM_URL = "https://instagram.com/gaming_eerr";
export const DEFAULT_INSTAGRAM_HANDLE = "@gaming_eerr";
export const DEFAULT_WIFI_SSID = "GamER";
export const DEFAULT_WIFI_PASSWORD = "";

/** Reference menu with full prices (matches the reference image). */
export const OPEN_DUO_MENU: MenuCategory[] = [
  {
    title: "Para recargar energía",
    subtitle: "Saludable & Rico",
    items: [
      {
        name: "Muffins proteicos",
        capsTitle: "MUFFINS PROTEICOS:",
        description: "Avena, huevos, cacao amargo.",
        priceLabel: "PRECIO POR UNIDAD",
        priceAmount: "$2000",
        emoji: "🧁",
        bgAccent: "orange",
      },
      {
        name: "Scones de queso caseros (rico)",
        capsTitle: "SCONES DE QUESO CASEROS:",
        description: "Harina, queso, manteca, leche, huevos.",
        priceLabel: "PRECIO POR UNIDAD",
        priceAmount: "$2000",
        emoji: "🧀",
        bgAccent: "green",
      },
    ],
  },
  {
    title: "Snacks para partidas",
    subtitle: "Dulces tentaciones",
    items: [
      {
        name: "Cookies",
        capsTitle: "COOKIES (X2 UNIDADES):",
        variants: [
          { bold: "Clásicas", rest: "(chocolate chip)," },
          { bold: "Red velvet", rest: "," },
          { bold: "Avena con pasas", rest: "." },
        ],
        priceLabel: "PRECIO X2 UNIDADES",
        priceAmount: "$1800",
        emoji: "🍪",
        bgAccent: "orange",
      },
      {
        name: "Budines",
        capsTitle: "BUDINES (PORCIÓN):",
        variants: [
          { bold: "Zanahoria", rest: "(harina integral, zanahoria, huevo, nueces);" },
          { bold: "Banana", rest: "(harina integral, banana, huevo, miel);" },
          { bold: "Marmolado", rest: "(harina común, vainilla, chocolate, huevos);" },
          { bold: "Limón", rest: "(harina común, limón, huevo, glaseado de limón)." },
        ],
        priceLabel: "PRECIO POR PORCIÓN",
        priceAmount: "$1500",
        emoji: "🍞",
        bgAccent: "green",
      },
    ],
  },
  {
    title: "Clásicos caseros",
    subtitle: "Sin TACC",
    items: [
      {
        name: "Alfajores de maicena caseros",
        capsTitle: "ALFAJORES DE MAICENA CASEROS:",
        description: "Sin TACC.",
        priceLabel: "PRECIO POR UNIDAD",
        priceAmount: "$1500",
        emoji: "🥮",
        bgAccent: "orange",
      },
    ],
  },
];

/**
 * Default menu — same items and labels, but with the price amount left blank
 * so a white space prints over which the price can be hand-written. This is
 * the recommended pre-print mode for events with shifting pricing.
 */
export const OPEN_DUO_MENU_LABELS_ONLY: MenuCategory[] = OPEN_DUO_MENU.map((cat) => ({
  ...cat,
  items: cat.items.map((it) => ({ ...it, priceAmount: undefined })),
}));

/** Same items, fully blank price area (no label either). */
export const OPEN_DUO_MENU_BLANK: MenuCategory[] = OPEN_DUO_MENU.map((cat) => ({
  ...cat,
  items: cat.items.map((it) => ({ ...it, priceLabel: undefined, priceAmount: undefined })),
}));

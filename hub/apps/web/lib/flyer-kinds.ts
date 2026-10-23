import type { FlyerBrand } from "@/lib/flyer-brands";
import { JAM_FLYER_DATA } from "@/lib/jam-flyer-data";

/** Flyer types. "event" is the standard announcement; teaser and countdown are pre-event; infographic explains details. */
export type FlyerKind = "event" | "teaser" | "countdown" | "infographic";

export const FLYER_KINDS: Record<FlyerKind, { label: string; hint: string }> = {
  event: { label: "Evento", hint: "Anuncio completo con fecha y lugar" },
  teaser: { label: "Save the date", hint: "Fecha destacada, sin lugar ni detalles" },
  countdown: { label: "Cuenta regresiva", hint: "Días, horas y minutos hasta el evento" },
  infographic: { label: "Infografía", hint: "Datos clave: precios, horarios, cupos, participantes" },
};

/** Layouts the event flyer can take. Each one is a different composition, not a recolour. */
export type EventLayout = "centrado" | "editorial" | "ticket" | "hoy";

/**
 * Repost variants of the event flyer. Each variant has its own layout and emphasis,
 * so the same event can be shared again without looking copy-pasted.
 */
export const EVENT_VARIANTS = {
  principal: { label: "Principal", prefix: "", layout: "centrado" },
  recordatorio: { label: "Recordatorio", prefix: "Recordatorio · ", layout: "editorial" },
  "ultimos-lugares": { label: "Últimos lugares", prefix: "Últimos lugares · ", layout: "ticket" },
  "dia-d": { label: "Día D", prefix: "¡Es hoy! · ", layout: "hoy" },
} as const satisfies Record<string, { label: string; prefix: string; layout: EventLayout }>;
export type EventVariant = keyof typeof EVENT_VARIANTS;

/** Layouts for the infographic flyer. */
export const INFOGRAPHIC_VARIANTS = {
  tarjetas: { label: "Tarjetas", hint: "Un bloque por dato, en grilla" },
  cronograma: { label: "Cronograma", hint: "Lista vertical en orden, para horarios y etapas" },
  cupos: { label: "Cupos", hint: "Barras de ocupación cuando el dato es “usados/total”" },
} as const;
export type InfographicVariant = keyof typeof INFOGRAPHIC_VARIANTS;

/** Where the event takes place. "mirador" is the MiradorTEC logo; "logo" is an uploaded image. */
export type VenueMode = "mirador" | "text" | "logo" | "none";

export interface VenueData {
  mode: VenueMode;
  text: string;
  logoSrc: string;
}

/** Content blocks that can be hidden from the flyer. Keys match the Contenido controls. */
export type FlyerFieldKey = "eyebrow" | "title" | "subtitle" | "date" | "venue" | "city" | "countdown" | "items" | "eventLogo" | "sponsors";

/** Sponsor or organiser logo for the footer. src is a path or a data URL. */
export interface SponsorLogo {
  name: string;
  src: string;
}

/** Layer tag set on the backdrop, so the design-elements export can tell decoration from content. */
export const BG_LAYER = "bg-elements";

/** Max sponsor logos drawn in the footer. */
export const MAX_SPONSORS = 6;

/** true = removed from the flyer. */
export type FlyerHidden = Partial<Record<FlyerFieldKey, boolean>>;

export interface FlyerData {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Empty means not announced yet; layouts then show "Próximamente". */
  dateText: string;
  venue: VenueData;
  city: string;
  /** Target instant for countdown flyers, ISO 8601 with offset. */
  countdownTo: string;
  /** One data point per line, written as "Etiqueta | Valor". */
  itemsText: string;
  background: FlyerBackground;
  /** Event logo drawn in the upper right corner. Empty means none. */
  eventLogo: string;
  /** Sponsor or organiser logos drawn in the footer. */
  sponsors: SponsorLogo[];
}

export interface InfoItem {
  label: string;
  value: string;
}

/** Shown in every date slot while no date is set. */
export const DATE_FALLBACK = "Próximamente";

export function variantEyebrow(data: FlyerData, variant: EventVariant): string {
  return `${EVENT_VARIANTS[variant].prefix}${data.eyebrow}`;
}

export function isFieldHidden(hidden: FlyerHidden, key: FlyerFieldKey): boolean {
  return hidden[key] === true;
}

/** The venue line is drawn only when it has something to show. */
export function venueShown(venue: VenueData): boolean {
  if (venue.mode === "none") return false;
  if (venue.mode === "text") return venue.text.trim() !== "";
  if (venue.mode === "logo") return venue.logoSrc !== "";
  return true;
}

/** Text used for a text venue. MiradorTEC is always its own name; the logo is drawn by the layout. */
export function venueText(venue: VenueData): string {
  if (venue.mode === "mirador") return "MiradorTEC";
  return venue.text.trim();
}

/** Parses "Etiqueta | Valor" lines. Lines without a label are skipped. */
export function parseItems(text: string): InfoItem[] {
  return text
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([label]) => label)
    .map(([label, value = ""]) => ({ label, value }));
}

export interface CountdownParts {
  finished: boolean;
  days: number;
  hours: number;
  minutes: number;
}

/** Splits the time left until `target` into days / hours / minutes. Never negative. */
export function countdownParts(target: string, now: Date): CountdownParts {
  const diff = new Date(target).getTime() - now.getTime();
  if (Number.isNaN(diff)) return { finished: false, days: 0, hours: 0, minutes: 0 };
  if (diff <= 0) return { finished: true, days: 0, hours: 0, minutes: 0 };
  const totalMin = Math.floor(diff / 60000);
  return {
    finished: false,
    days: Math.floor(totalMin / 1440),
    hours: Math.floor((totalMin % 1440) / 60),
    minutes: totalMin % 60,
  };
}

const EMPTY_VENUE: VenueData = { mode: "text", text: "", logoSrc: "" };

/**
 * Background patterns. "clasico" is each brand's own landing motif; the others are shared
 * patterns painted in the brand's accent colours.
 */
export const BACKGROUNDS = {
  clasico: { label: "Clásico", hint: "El fondo original de cada marca" },
  grilla: { label: "Grilla", hint: "Solo la retícula de la landing, pulsando" },
  resplandor: { label: "Resplandor", hint: "Dos brillos de marca que respiran desde arriba y abajo" },
  anillos: { label: "Anillos", hint: "Aros concéntricos de la landing de Jam" },
  puntos: { label: "Puntos", hint: "Campo de puntos doble, como el de GamER" },
  escaneo: { label: "Escaneo", hint: "Retícula con un barrido de luz que baja" },
  tablero: { label: "Tablero retro", hint: "Damero de 8 bits" },
  ondas: { label: "Ondas de radar", hint: "Anillos saliendo desde abajo" },
  burbujas: { label: "Burbujas", hint: "Manchas de color flotando" },
  cinta: { label: "Cinta de obra", hint: "Franjas diagonales, tipo precaución" },
} as const;
export type FlyerBackground = keyof typeof BACKGROUNDS;

/** Default copy per brand. Event data is placeholder until edited in the admin. */
export const FLYER_DEFAULTS: Record<FlyerBrand, FlyerData> = {
  jam: {
    eyebrow: JAM_FLYER_DATA.eyebrow,
    title: "Paraná Game Jam",
    subtitle: JAM_FLYER_DATA.heroText,
    dateText: JAM_FLYER_DATA.dateRange,
    venue: { mode: "mirador", text: "", logoSrc: "" },
    city: JAM_FLYER_DATA.city,
    countdownTo: "2026-10-16T09:00:00-03:00",
    itemsText: "Precio | A definir\nHorario | A definir\nCupos | 0/0\nParticipantes | 0",
    background: "clasico",
    eventLogo: "/gamejamplus-logo.png",
    sponsors: [
      { name: "GameDevs", src: "/gamedevs-icon.svg" },
      { name: "Ghost Creative Studio", src: "/ghost-creative-studio-logo.png" },
    ],
  },
  gamedevs: {
    eyebrow: "Comunidad de desarrollo",
    title: "GameDevs",
    subtitle: "Creá, colaborá y publicá tu juego.",
    dateText: "",
    venue: EMPTY_VENUE,
    city: "Entre Ríos",
    countdownTo: "2026-11-30T19:00:00-03:00",
    itemsText: "Precio | A definir\nHorario | A definir\nCupos | 0/0\nParticipantes | 0",
    background: "clasico",
    eventLogo: "",
    sponsors: [],
  },
  gamer: {
    eyebrow: "Próximo evento",
    title: "Torneo GamER",
    subtitle: "Competí con la comunidad gamer de Entre Ríos.",
    dateText: "",
    venue: EMPTY_VENUE,
    city: "Entre Ríos",
    countdownTo: "2026-11-30T19:00:00-03:00",
    itemsText: "Precio | A definir\nHorario | A definir\nCupos | 0/0\nParticipantes | 0",
    background: "clasico",
    eventLogo: "",
    sponsors: [],
  },
};

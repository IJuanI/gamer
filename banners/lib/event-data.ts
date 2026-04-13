/**
 * Event data types and sample data for GamER banner generation.
 *
 * LLM agents: modify SAMPLE_EVENTS or create new EventData objects
 * to generate banners for real upcoming events.
 */

/** Accent color palette used for per-game theming in spotlight banners. */
export type AccentColor = "purple" | "green" | "orange" | "blue";

/** rgba() prefix (open paren) — append opacity + ")" to complete the value. */
export const ACCENT_RGBA: Record<AccentColor, string> = {
  purple: "rgba(179,57,196,",
  green:  "rgba(132,197,82,",
  orange: "rgba(255,130,0,",
  blue:   "rgba(80,160,230,",
};

/** Solid hex for accent text / labels. */
export const ACCENT_HEX: Record<AccentColor, string> = {
  purple: "#C06DD0",
  green:  "#96D068",
  orange: "#FF8200",
  blue:   "#64A8E0",
};

/** Per-game details used in Spotlight banners. */
export interface GameDetail {
  /** Full display name, e.g. "LEAGUE OF LEGENDS" */
  name: string;
  /** Short badge name, e.g. "LOL" */
  shortName: string;
  /** Format label shown on spotlight, e.g. "ARAM 2V2" */
  format: string;
  /** Team count / bracket description */
  teams: string;
  /** Schedule string */
  schedule: string;
  caster?: string;
  /** Accent color for this game's spotlight */
  accent: AccentColor;
}

export interface EventData {
  /** Nombre del evento */
  title: string;
  /** Subtítulo o descripción corta */
  subtitle: string;
  /** Tipo de evento */
  type: "torneo-hibrido" | "cyber-cafe" | "torneo-online" | "torneo-presencial";
  /** Juego(s) del evento (display names) */
  games: string[];
  /** Fecha del evento (texto formateado) */
  date: string;
  /** Hora del evento */
  time: string;
  /** Lugar físico (si aplica) */
  venue?: string;
  /** Path to venue logo image (e.g. "/mirador-tec.png") */
  venueLogo?: string;
  /** Ciudad */
  city: string;
  /** Precio de inscripción al torneo */
  entryFee?: string;
  /** Precio de entrada para público general (sin inscripción al torneo) */
  publicEntryFee?: string;
  /** Juegos disponibles en consolas para el público general */
  consoleGames?: string[];
  /** Premio(s) */
  prizes?: string[];
  /** Plataformas (PC, PS5, etc.) */
  platforms?: string[];
  /** Info adicional */
  extraInfo?: string;
  /** Cantidad máxima de participantes */
  maxPlayers?: number;
  /**
   * Which banner templates are available for this event.
   * - "anuncio"   — announcement banners
   * - "countdown" — days-until-event banners
   * - "spotlight" — per-game detail banners (requires gameDetails)
   */
  availableTemplates: Array<"anuncio" | "countdown" | "spotlight" | "publico">;
  /**
   * Per-game details for Spotlight banners.
   * Order determines display order in the game selector.
   */
  gameDetails?: GameDetail[];
}

// ===== OPEN DUO EVENT =====

export const OPEN_DUO_EVENT: EventData = {
  title: "OPEN DUO",
  subtitle: "Jornada de Torneos eSports en MiradorTec",
  type: "torneo-presencial",
  games: ["League of Legends", "Counter-Strike 2"],
  date: "Sábado 25 de Abril",
  time: "15:00 a 21:00 HS",
  venue: "MiradorTec",
  venueLogo: "/mirador-tec.png",
  city: "Paraná, Entre Ríos",
  entryFee: "$7.500 por persona",
  publicEntryFee: "$3.000 por persona",
  consoleGames: ["FIFA 25", "Mortal Kombat 1", "Tekken 8"],
  prizes: ["1° - $65.000", "2° - $35.000"],
  platforms: ["PC"],
  maxPlayers: 16,
  extraInfo: "Formato 2v2 · Llave de 8 equipos · Transmisión en vivo por Twitch",
  availableTemplates: ["anuncio", "countdown", "spotlight", "publico"],
  gameDetails: [
    {
      name: "LEAGUE OF LEGENDS",
      shortName: "LOL",
      format: "ARAM 2V2",
      teams: "8 equipos (llave simple)",
      schedule: "16:00 a 18:25 HS",
      caster: 'Martin "TroyanoLoco" Garcia',
      accent: "purple",
    },
    {
      name: "COUNTER-STRIKE 2",
      shortName: "CS2",
      format: "WINGMAN 2V2",
      teams: "8 equipos (llave simple)",
      schedule: "18:45 a 21:00 HS",
      caster: "Limoncete",
      accent: "green",
    },
  ],
};

// ===== SAMPLE EVENTS =====
// LLM agents: use these as templates, modify for real events

export const COPA_ER_EVENT: EventData = {
  title: "COPA ER",
  subtitle: "Torneo Presencial Multi-Juego en Paraná",
  type: "torneo-presencial",
  games: ["Valorant", "Rocket League"],
  date: "Sábado 17 de Mayo",
  time: "14:00 a 22:00 HS",
  venue: "MiradorTec",
  venueLogo: "/mirador-tec.png",
  city: "Paraná, Entre Ríos",
  entryFee: "$6.000 por persona",
  prizes: ["1° - $80.000", "2° - $40.000", "3° - $20.000"],
  platforms: ["PC"],
  maxPlayers: 40,
  extraInfo: "Fase de grupos + eliminación directa · Stream en vivo por Twitch",
  availableTemplates: ["anuncio", "countdown", "spotlight"],
  gameDetails: [
    {
      name: "VALORANT",
      shortName: "VAL",
      format: "5V5",
      teams: "8 equipos (fase de grupos)",
      schedule: "14:00 a 18:00 HS",
      caster: "Sofía",
      accent: "blue",
    },
    {
      name: "ROCKET LEAGUE",
      shortName: "RL",
      format: "3V3",
      teams: "8 equipos (llave simple)",
      schedule: "18:30 a 22:00 HS",
      caster: "Martín",
      accent: "orange",
    },
  ],
};

export const SAMPLE_EVENTS: EventData[] = [
  OPEN_DUO_EVENT,
  COPA_ER_EVENT,
];

/** Helper: get a sample event by index */
export function getSampleEvent(index: number = 0): EventData {
  return SAMPLE_EVENTS[index % SAMPLE_EVENTS.length];
}

/** Spanish list join: "A", "A y B", "A, B y C" */
export function joinGameNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

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
  /** Format label shown on spotlight, e.g. "ARAM 2V2" (optional) */
  format?: string;
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
  /** Formato del torneo para banners públicos, e.g. "2v2", "1v1" */
  tournamentFormat?: string;
  /** Highlight grande arriba del título en banners de anuncio, e.g. "2 VS 2", "1 VS 1" */
  matchFormat?: string;
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

// ===== EDIT HELPERS =====

/** Display names derived from gameDetails (trimmed, empties dropped). */
export function getGameDisplayNames(gameDetails?: GameDetail[]): string[] {
  return (gameDetails ?? []).map((game) => game.name.trim()).filter(Boolean);
}

/** Deep-ish clone of an event so it can be edited without mutating samples. */
export function cloneEventForEditing(event: EventData): EventData {
  const gameDetails = event.gameDetails?.map((game) => ({ ...game }));
  return {
    ...event,
    availableTemplates: [...event.availableTemplates],
    games: getGameDisplayNames(gameDetails),
    gameDetails,
    consoleGames: event.consoleGames ? [...event.consoleGames] : undefined,
  };
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
  consoleGames: ["Mario Kart 8", "DB Fighter Z", "Mortal Kombat"],
  prizes: ["1° - $65.000", "2° - $35.000"],
  platforms: ["PC"],
  maxPlayers: 16,
  extraInfo: "Formato 2v2 · Llave de 8 equipos · Transmisión en vivo por Twitch",
  tournamentFormat: "2v2",
  matchFormat: "2 VS 2",
  availableTemplates: ["anuncio", "countdown", "spotlight", "publico"],
  gameDetails: [
    {
      name: "LEAGUE OF LEGENDS",
      shortName: "LOL",
      teams: "8 equipos (llave simple)",
      schedule: "16:00 a 18:25 HS",
      caster: 'Martin "TroyanoLoco" Garcia',
      accent: "purple",
    },
    {
      name: "COUNTER-STRIKE 2",
      shortName: "CS2",
      teams: "8 equipos (llave simple)",
      schedule: "18:45 a 21:00 HS",
      caster: "Limoncete",
      accent: "green",
    },
  ],
};

// ===== WINTER KNOCKOUT EVENT =====

export const WINTER_KNOCKOUT_EVENT: EventData = {
  title: "WINTER KNOCKOUT",
  subtitle: "Torneo de Lucha y Smash en MiradorTec",
  type: "torneo-presencial",
  games: ["Mortal Kombat", "Super Smash Bros Ultimate"],
  date: "Viernes 18 de Julio",
  time: "16:00 a 22:00 HS",
  venue: "MiradorTec",
  venueLogo: "/mirador-tec.png",
  city: "Paraná, Entre Ríos",
  entryFee: "$10.000 por persona",
  publicEntryFee: "$5.000 por persona",
  consoleGames: [],
  prizes: ["1° - $45.000", "2° - $20.000"],
  platforms: ["Nintendo Switch", "Arcade"],
  extraInfo: "Torneos 1v1 por juego · Transmisión en vivo por Twitch",
  tournamentFormat: "1v1",
  matchFormat: "1 VS 1",
  availableTemplates: ["anuncio", "countdown", "spotlight", "publico"],
  gameDetails: [
    {
      name: "MORTAL KOMBAT",
      shortName: "MK",
      teams: "16 jugadores",
      schedule: "16:00 a 18:30 HS",
      accent: "orange",
    },
    {
      name: "SUPER SMASH BROS ULTIMATE",
      shortName: "SSBU",
      teams: "16 jugadores",
      schedule: "19:00 a 22:00 HS",
      accent: "purple",
    },
  ],
};

// ===== WINTER SHOOT N' KICK EVENT =====

export const WINTER_SHOOT_KICK_EVENT: EventData = {
  title: "WINTER SHOOT N' KICK",
  subtitle: "Torneo de Fútbol y Táctico en MiradorTec",
  type: "torneo-presencial",
  games: ["Fifa", "Valorant"],
  date: "Viernes 1 de Agosto",
  time: "15:00 a 21:00 HS",
  venue: "MiradorTec",
  venueLogo: "/mirador-tec.png",
  city: "Paraná, Entre Ríos",
  entryFee: "$8.000 por persona",
  publicEntryFee: "$3.000 por persona",
  consoleGames: [],
  prizes: ["1° - $65.000", "2° - $35.000"],
  platforms: ["PS5", "PC"],
  extraInfo: "Formato 2v2 · Transmisión en vivo por Twitch",
  tournamentFormat: "2v2",
  matchFormat: "2 VS 2",
  availableTemplates: ["anuncio", "countdown", "spotlight", "publico"],
  gameDetails: [
    {
      name: "FIFA",
      shortName: "FIFA",
      teams: "8 equipos",
      schedule: "15:00 a 17:30 HS",
      accent: "green",
    },
    {
      name: "VALORANT",
      shortName: "VAL",
      teams: "8 equipos",
      schedule: "18:00 a 21:00 HS",
      accent: "blue",
    },
  ],
};

// ===== SAMPLE EVENTS =====
// LLM agents: use these as templates, modify for real events

export const SAMPLE_EVENTS: EventData[] = [
  OPEN_DUO_EVENT,
  WINTER_KNOCKOUT_EVENT,
  WINTER_SHOOT_KICK_EVENT,
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

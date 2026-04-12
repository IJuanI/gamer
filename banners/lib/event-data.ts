/**
 * Event data types and sample data for GamER banner generation.
 *
 * LLM agents: modify SAMPLE_EVENTS or create new EventData objects
 * to generate banners for real upcoming events.
 */

export interface EventData {
  /** Nombre del evento */
  title: string;
  /** Subtítulo o descripción corta */
  subtitle: string;
  /** Tipo de evento */
  type: "torneo-hibrido" | "cyber-cafe" | "torneo-online" | "torneo-presencial";
  /** Juego(s) del evento */
  games: string[];
  /** Fecha del evento (texto formateado) */
  date: string;
  /** Hora del evento */
  time: string;
  /** Lugar físico (si aplica) */
  venue?: string;
  /** Ciudad */
  city: string;
  /** Precio de inscripción */
  entryFee?: string;
  /** Premio(s) */
  prizes?: string[];
  /** Plataformas (PC, PS5, etc.) */
  platforms?: string[];
  /** Info adicional */
  extraInfo?: string;
  /** Cantidad máxima de participantes */
  maxPlayers?: number;
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
  city: "Paraná, Entre Ríos",
  entryFee: "$7.500 por persona",
  prizes: ["1° - $65.000", "2° - $35.000"],
  platforms: ["PC"],
  maxPlayers: 16,
  extraInfo: "Formato 2v2 · Llave de 8 equipos · Transmisión en vivo por Twitch",
};

// ===== SAMPLE EVENTS =====
// LLM agents: use these as templates, modify for real events

export const SAMPLE_EVENTS: EventData[] = [
  OPEN_DUO_EVENT,
  {
    title: "TORNEO VALORANT",
    subtitle: "Clasificatorio Regional Entre Ríos",
    type: "torneo-hibrido",
    games: ["Valorant"],
    date: "Sábado 26 de Abril",
    time: "15:00 HS",
    venue: "Nexus Cyber Café",
    city: "Paraná, Entre Ríos",
    entryFee: "Gratis",
    prizes: ["1° - $50.000", "2° - $25.000", "3° - $10.000"],
    platforms: ["PC"],
    maxPlayers: 40,
    extraInfo: "Formato: 5v5 Eliminación directa",
  },
  {
    title: "NOCHE DE CYBER",
    subtitle: "Gaming Night en el Cyber",
    type: "cyber-cafe",
    games: ["CS2", "Valorant", "League of Legends", "Fortnite"],
    date: "Viernes 2 de Mayo",
    time: "20:00 a 02:00 HS",
    venue: "Nexus Cyber Café",
    city: "Paraná, Entre Ríos",
    entryFee: "$2.000 por persona",
    platforms: ["PC"],
    extraInfo: "Incluye snacks y bebidas. Trae tu equipo o usá los nuestros.",
  },
  {
    title: "COPA GAMER ER",
    subtitle: "Torneo Híbrido Multi-Juego",
    type: "torneo-hibrido",
    games: ["Rocket League", "FIFA 25", "Mortal Kombat 1"],
    date: "10 y 11 de Mayo",
    time: "Desde las 14:00 HS",
    venue: "Centro de Convenciones",
    city: "Paraná, Entre Ríos",
    entryFee: "$5.000 por equipo",
    prizes: ["1° - $100.000", "2° - $50.000"],
    platforms: ["PC", "PS5", "Xbox"],
    maxPlayers: 64,
    extraInfo: "Inscripción online o presencial. Stream en vivo por Twitch.",
  },
];

/** Helper: get a sample event by index */
export function getSampleEvent(index: number = 0): EventData {
  return SAMPLE_EVENTS[index % SAMPLE_EVENTS.length];
}

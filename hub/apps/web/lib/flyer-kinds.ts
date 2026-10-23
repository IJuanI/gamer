import type { FlyerBrand } from "@/lib/flyer-brands";
import { JAM_FLYER_DATA } from "@/lib/jam-flyer-data";

/** Flyer types. "event" is the standard announcement; teaser and countdown are pre-event. */
export type FlyerKind = "event" | "teaser" | "countdown";

export const FLYER_KINDS: Record<FlyerKind, { label: string; hint: string }> = {
  event: { label: "Evento", hint: "Anuncio completo con fecha y lugar" },
  teaser: { label: "Save the date", hint: "Fecha destacada, sin lugar ni detalles" },
  countdown: { label: "Cuenta regresiva", hint: "Días, horas y minutos hasta el evento" },
};

/**
 * Repost variants of the event flyer. Same artwork, different eyebrow line,
 * so the same event can be shared again without looking copy-pasted.
 */
export const EVENT_VARIANTS = {
  principal: { label: "Principal", prefix: "" },
  recordatorio: { label: "Recordatorio", prefix: "Recordatorio · " },
  "ultimos-lugares": { label: "Últimos lugares", prefix: "Últimos lugares · " },
  "dia-d": { label: "Día D", prefix: "¡Es hoy! · " },
} as const;
export type EventVariant = keyof typeof EVENT_VARIANTS;

export interface FlyerData {
  eyebrow: string;
  title: string;
  subtitle: string;
  dateText: string;
  venue: string;
  city: string;
  /** Target instant for countdown flyers, ISO 8601 with offset. */
  countdownTo: string;
}

export function variantEyebrow(data: FlyerData, variant: EventVariant): string {
  return `${EVENT_VARIANTS[variant].prefix}${data.eyebrow}`;
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

/** Date text used while the real date is unknown. Layouts render it as a status line, never a headline. */
export const DATE_PLACEHOLDER = "Fecha a confirmar";

/** Default copy per brand. Event data is placeholder until edited in the admin. */
export const FLYER_DEFAULTS: Record<FlyerBrand, FlyerData> = {
  jam: {
    eyebrow: JAM_FLYER_DATA.eyebrow,
    title: "Paraná Game Jam",
    subtitle: JAM_FLYER_DATA.heroText,
    dateText: JAM_FLYER_DATA.dateRange,
    venue: JAM_FLYER_DATA.venue,
    city: JAM_FLYER_DATA.city,
    countdownTo: "2026-10-16T09:00:00-03:00",
  },
  gamedevs: {
    eyebrow: "Comunidad de desarrollo",
    title: "GameDevs",
    subtitle: "Creá, colaborá y publicá tu juego.",
    dateText: DATE_PLACEHOLDER,
    venue: "",
    city: "Entre Ríos",
    countdownTo: "2026-11-30T19:00:00-03:00",
  },
  gamer: {
    eyebrow: "Próximo evento",
    title: "Torneo GamER",
    subtitle: "Competí con la comunidad gamer de Entre Ríos.",
    dateText: DATE_PLACEHOLDER,
    venue: "",
    city: "Entre Ríos",
    countdownTo: "2026-11-30T19:00:00-03:00",
  },
};

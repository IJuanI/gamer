/** es-AR locale formatting helpers. The hub is Argentine-Spanish only. */

export const LOCALE = "es-AR";

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/** Format an ISO timestamp as a long es-AR date, e.g. "30 de junio de 2026". */
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

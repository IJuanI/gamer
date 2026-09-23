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

/** Format an ISO timestamp as a short relative time, e.g. "hace 5m". */
export function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "recién";
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  return `hace ${diffD}d`;
}

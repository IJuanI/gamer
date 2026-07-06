"use strict";
/** es-AR locale formatting helpers. The hub is Argentine-Spanish only. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCALE = void 0;
exports.formatDate = formatDate;
exports.LOCALE = "es-AR";
const dateFmt = new Intl.DateTimeFormat(exports.LOCALE, {
    day: "2-digit",
    month: "long",
    year: "numeric",
});
/** Format an ISO timestamp as a long es-AR date, e.g. "30 de junio de 2026". */
function formatDate(iso) {
    return dateFmt.format(new Date(iso));
}

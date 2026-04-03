export function canQuoteBooking(params: {
  packageCode: string;
  visitDate: string;
  adults: number;
}) {
  return Boolean(params.packageCode && params.visitDate && params.adults > 0);
}

export function needsBookingQuote(params: {
  couponCode?: string;
  inapamVisitors: number;
}) {
  return Boolean(params.couponCode?.trim()) || params.inapamVisitors > 0;
}

function parseLocalDateInput(date: string) {
  if (!date) return null;

  // Caso input type="date" => YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  // Caso ISO completo o cualquier otro string de fecha
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}

export function formatMoney(
  amount = 0,
  currency = "MXN",
  locale: "es" | "en" = "es"
) {
  return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export function toApiVisitDate(date: string) {
  const parsed = parseLocalDateInput(date);
  if (!parsed) return "";

  return parsed.toISOString();
}

export function formatHumanDate(date: string, locale: "es" | "en" = "es") {
  const parsed = parseLocalDateInput(date);
  if (!parsed) return "";

  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}
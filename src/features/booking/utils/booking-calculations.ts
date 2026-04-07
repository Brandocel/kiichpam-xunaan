import type { BookingLocale } from "../types/booking.types";

export function canQuoteBooking(params: {
  packageCode: string;
  visitDate: string;
  adults: number;
  children: number;
  infants: number;
}) {
  const totalVisitors = params.adults + params.children + params.infants;

  return Boolean(
    params.packageCode.trim() &&
      params.visitDate.trim() &&
      totalVisitors > 0
  );
}

export function shouldFetchBookingQuote(params: {
  packageCode: string;
  visitDate: string;
  adults: number;
  children: number;
  infants: number;
}) {
  return canQuoteBooking(params);
}

function parseLocalDateInput(date: string) {
  if (!date) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}

export function formatMoney(
  amount = 0,
  currency = "MXN",
  locale: BookingLocale = "es"
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

export function formatHumanDate(date: string, locale: BookingLocale = "es") {
  const parsed = parseLocalDateInput(date);
  if (!parsed) return "";

  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function formatDateTime(date: string, locale: BookingLocale = "es") {
  const parsed = parseLocalDateInput(date) ?? new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export function normalizeCouponCode(value: string) {
  return value.trim().toUpperCase();
}

export function normalizeExtras(
  extras: Array<{ code: string; qty: number }> = []
) {
  return [...extras]
    .filter((item) => item.code?.trim() && item.qty > 0)
    .map((item) => ({
      code: item.code.trim().toUpperCase(),
      qty: item.qty,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function buildBookingSignature(input: {
  packageCode: string;
  visitDate: string;
  adults: number;
  children: number;
  infants: number;
  inapamVisitors: number;
  couponCode: string;
  lang: BookingLocale;
  extras?: Array<{ code: string; qty: number }>;
}) {
  return JSON.stringify({
    packageCode: input.packageCode.trim().toUpperCase(),
    visitDate: input.visitDate.trim(),
    adults: input.adults,
    children: input.children,
    infants: input.infants,
    inapamVisitors: input.inapamVisitors,
    couponCode: normalizeCouponCode(input.couponCode),
    lang: input.lang,
    extras: normalizeExtras(input.extras),
  });
}
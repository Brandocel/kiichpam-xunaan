import type { ApiReservation } from "../types/reservation.types";

type MoneyValue = number | string | null | undefined;

function toSafeNumber(value: MoneyValue) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * El nombre se mantiene por compatibilidad con los imports existentes.
 * Pero ahora NO divide entre 100 porque la API ya regresa el monto normal.
 */
export function formatMoneyFromCents(value: MoneyValue, currency = "MXN") {
  const amount = toSafeNumber(value);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatValue(value: unknown, fallback = "Sin información") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : fallback;
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  return String(value);
}

export function getCustomerName(reservation: ApiReservation) {
  const firstName = reservation.customer?.firstName?.trim() || "";
  const lastName = reservation.customer?.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Cliente sin nombre";
}

export function getTotalPassengers(reservation: ApiReservation) {
  const adults = Number(reservation.passengers?.adults || 0);
  const children = Number(reservation.passengers?.children || 0);
  const infants = Number(reservation.passengers?.infants || 0);

  return adults + children + infants;
}

export function getReservationReference(reservation: ApiReservation) {
  return (
    reservation.reference ||
    reservation.attribution?.reference ||
    reservation.utmSource ||
    reservation.attribution?.utmSource ||
    "Pagina WEB"
  );
}
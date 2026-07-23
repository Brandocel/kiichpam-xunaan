import {
  getReservationStatusLabel,
  type ApiReservation,
} from "@/features/admin/reservations/types/reservation.types";
import {
  getCustomerName,
  getReservationReference,
} from "@/features/admin/reservations/utils/reservation-formatters";
import { formatVisitDate } from "@/features/admin/reservations/utils/formatVisitDate";
import type { ReportColumn } from "./report-export";

export type ReservationReportRow = {
  folio: string;
  status: string;
  statusLabel: string;
  visitDate: string;
  visitDateLabel: string;
  createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  country: string;
  packageCode: string;
  reference: string;
  campaign: string;
  coupon: string;
  adults: number;
  children: number;
  infants: number;
  inapam: number;
  totalPax: number;
  subtotalMXN: number;
  extrasMXN: number;
  discountMXN: number;
  totalMXN: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference: string;
};

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function toText(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;

  const text = String(value).trim();

  return text || fallback;
}

function getDateOnly(value?: string | null) {
  const match = String(value || "").match(/^(\d{4}-\d{2}-\d{2})/);

  return match ? match[1] : "";
}

function formatCreatedAt(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Cancun",
  }).format(date);
}

function getLastPayment(reservation: ApiReservation) {
  const payments = reservation.payments || [];

  return payments.length > 0 ? payments[payments.length - 1] : null;
}

function getAppliedCampaign(reservation: ApiReservation) {
  const applied = reservation.campaign?.appliedCampaignCodes;

  if (Array.isArray(applied) && applied.length > 0) {
    return applied.join(" / ");
  }

  return toText(reservation.campaign?.campaignCode) ||
    toText(reservation.attribution?.utmCampaign);
}

export function mapReservationToReportRow(
  reservation: ApiReservation
): ReservationReportRow {
  const payment = getLastPayment(reservation);

  const adults = toNumber(reservation.passengers?.adults);
  const children = toNumber(reservation.passengers?.children);
  const infants = toNumber(reservation.passengers?.infants);
  const inapam = toNumber(reservation.passengers?.inapamVisitors);

  const discountMXN =
    toNumber(reservation.pricing?.discountMXN) ||
    toNumber(reservation.pricing?.campaignDiscountMXN) +
      toNumber(reservation.pricing?.couponDiscountMXN) +
      toNumber(reservation.pricing?.inapamDiscountMXN);

  return {
    folio: toText(reservation.folio),
    status: toText(reservation.status),
    statusLabel: getReservationStatusLabel(reservation.status),
    visitDate: getDateOnly(reservation.visitDate),
    visitDateLabel: formatVisitDate(reservation.visitDate),
    createdAt: formatCreatedAt(reservation.createdAt),
    customerName: getCustomerName(reservation),
    email: toText(reservation.customer?.email),
    phone: toText(reservation.customer?.phone),
    country: toText(reservation.customer?.country),
    packageCode: toText(reservation.package?.code, "Sin paquete"),
    reference: toText(getReservationReference(reservation), "Pagina WEB"),
    campaign: getAppliedCampaign(reservation),
    coupon: toText(reservation.coupon?.couponCode),
    adults,
    children,
    infants,
    inapam,
    totalPax: adults + children + infants,
    subtotalMXN: toNumber(reservation.pricing?.subtotalMXN),
    extrasMXN: toNumber(reservation.pricing?.extrasMXN),
    discountMXN,
    totalMXN: toNumber(reservation.pricing?.totalMXN),
    currency: toText(reservation.pricing?.currency, "MXN"),
    paymentMethod: toText(payment?.method) || toText(payment?.provider),
    paymentStatus: toText(payment?.status),
    paymentReference: toText(payment?.reference),
  };
}

function money(value: number) {
  return value.toFixed(2);
}

export const reservationReportColumns: ReportColumn<ReservationReportRow>[] = [
  { key: "folio", header: "Folio", value: (row) => row.folio },
  { key: "status", header: "Estado", value: (row) => row.statusLabel },
  {
    key: "visitDate",
    header: "Fecha de visita",
    value: (row) => row.visitDate,
  },
  { key: "createdAt", header: "Creada", value: (row) => row.createdAt },
  { key: "customer", header: "Cliente", value: (row) => row.customerName },
  { key: "email", header: "Email", value: (row) => row.email },
  { key: "phone", header: "Teléfono", value: (row) => row.phone },
  { key: "country", header: "País", value: (row) => row.country },
  { key: "package", header: "Paquete", value: (row) => row.packageCode },
  { key: "reference", header: "Origen", value: (row) => row.reference },
  { key: "campaign", header: "Campaña", value: (row) => row.campaign },
  { key: "coupon", header: "Cupón", value: (row) => row.coupon },
  {
    key: "adults",
    header: "Adultos",
    align: "center",
    value: (row) => row.adults,
  },
  {
    key: "children",
    header: "Niños",
    align: "center",
    value: (row) => row.children,
  },
  {
    key: "infants",
    header: "Infantes",
    align: "center",
    value: (row) => row.infants,
  },
  {
    key: "inapam",
    header: "INAPAM",
    align: "center",
    value: (row) => row.inapam,
  },
  {
    key: "totalPax",
    header: "Pax total",
    align: "center",
    value: (row) => row.totalPax,
  },
  {
    key: "subtotal",
    header: "Subtotal",
    align: "right",
    value: (row) => money(row.subtotalMXN),
  },
  {
    key: "extras",
    header: "Extras",
    align: "right",
    value: (row) => money(row.extrasMXN),
  },
  {
    key: "discount",
    header: "Descuento",
    align: "right",
    value: (row) => money(row.discountMXN),
  },
  {
    key: "total",
    header: "Total",
    align: "right",
    value: (row) => money(row.totalMXN),
  },
  { key: "currency", header: "Moneda", value: (row) => row.currency },
  {
    key: "paymentMethod",
    header: "Método de pago",
    value: (row) => row.paymentMethod,
  },
  {
    key: "paymentStatus",
    header: "Estado del pago",
    value: (row) => row.paymentStatus,
  },
  {
    key: "paymentReference",
    header: "Referencia de pago",
    value: (row) => row.paymentReference,
  },
];

export type ReservationReportTotals = {
  reservations: number;
  pax: number;
  revenue: number;
  paidRevenue: number;
  byStatus: { key: string; label: string; count: number }[];
  byReference: { key: string; count: number; revenue: number }[];
};

const PAID_STATUSES = ["PAID", "COMPLETED"];

export function buildReservationReportTotals(
  rows: ReservationReportRow[]
): ReservationReportTotals {
  const statusMap = new Map<string, number>();
  const referenceMap = new Map<string, { count: number; revenue: number }>();

  let pax = 0;
  let revenue = 0;
  let paidRevenue = 0;

  rows.forEach((row) => {
    pax += row.totalPax;
    revenue += row.totalMXN;

    if (PAID_STATUSES.includes(row.status)) {
      paidRevenue += row.totalMXN;
    }

    statusMap.set(row.status, (statusMap.get(row.status) || 0) + 1);

    const referenceEntry = referenceMap.get(row.reference) || {
      count: 0,
      revenue: 0,
    };

    referenceMap.set(row.reference, {
      count: referenceEntry.count + 1,
      revenue: referenceEntry.revenue + row.totalMXN,
    });
  });

  return {
    reservations: rows.length,
    pax,
    revenue,
    paidRevenue,
    byStatus: Array.from(statusMap.entries())
      .map(([key, count]) => ({
        key,
        label: getReservationStatusLabel(key),
        count,
      }))
      .sort((a, b) => b.count - a.count),
    byReference: Array.from(referenceMap.entries())
      .map(([key, entry]) => ({ key, ...entry }))
      .sort((a, b) => b.count - a.count),
  };
}

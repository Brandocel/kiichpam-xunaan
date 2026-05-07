export type ApiReservationStatus =
  | "DRAFT"
  | "PROCESSING_PAYMENT"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED"
  | "COMPLETED"
  | "NO_SHOW"
  | string;

export type ApiPassengerInfo = {
  adults: number;
  children: number;
  infants: number;
};

export type ApiReservationCustomer = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  comments: string | null;
};

export type ApiReservationPackage = {
  id: string;
  code: string;
  currency: string;
  coverMedia: string | null;
};

export type ApiReservationPricing = {
  peopleSubtotalMXN: number;
  subtotalMXN: number;
  extrasMXN: number;
  discountMXN: number;
  campaignDiscountMXN: number;
  couponDiscountMXN: number;
  inapamDiscountMXN: number;
  totalMXN: number;
  currency: string;
};

export type ApiReservationCampaign = {
  campaignCode: string | null;
  appliedCampaignCodes: string | null;
};

export type ApiReservationCoupon = {
  couponCode: string | null;
  couponDiscountMXN: number;
};

export type ApiReservation = {
  id: string;
  folio: string;
  status: ApiReservationStatus;
  visitDate: string;
  passengers: ApiPassengerInfo;
  customer: ApiReservationCustomer;
  package: ApiReservationPackage;
  pricing: ApiReservationPricing;
  campaign: ApiReservationCampaign;
  coupon: ApiReservationCoupon;
  extras: unknown[];
  payments: unknown[];
  createdAt: string;
  updatedAt: string;
};

export type ApiReservationFilters = {
  page: number;
  limit: number;
  search: string | null;
  status: string | null;
  packageCode: string | null;
  email: string | null;
  from: string | null;
  to: string | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export type ApiReservationPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ApiReservationSummary = {
  total: number;
  byStatus: Record<string, number>;
};

export type ApiReservationsListResponse = {
  success: boolean;
  message: string;
  filters: ApiReservationFilters;
  pagination: ApiReservationPagination;
  summary: ApiReservationSummary;
  data: ApiReservation[];
};

export type ApiSingleReservationResponse = {
  success: boolean;
  message: string;
  data: ApiReservation;
};

export type ApiGenericResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  [key: string]: unknown;
};

export type AdminReservationListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  packageCode?: string;
  email?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const reservationStatusOptions = [
  "DRAFT",
  "PROCESSING_PAYMENT",
  "PAID",
  "CANCELLED",
  "REFUNDED",
  "COMPLETED",
  "NO_SHOW",
];

export const reservationStatusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PROCESSING_PAYMENT: "Procesando pago",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
  COMPLETED: "Completada",
  NO_SHOW: "No show",
};

export function getReservationStatusLabel(status: string | null | undefined) {
  if (!status) return "Sin estado";
  return reservationStatusLabels[status] || status;
}
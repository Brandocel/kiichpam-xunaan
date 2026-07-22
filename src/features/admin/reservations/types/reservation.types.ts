export type ReservationSortBy = "createdAt" | "visitDate" | "totalMXN";
export type ReservationSortOrder = "asc" | "desc";

export type ReservationStatus =
  | "DRAFT"
  | "PROCESSING_PAYMENT"
  | "PAID"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "REFUNDED"
  | string;

export type ReservationReference =
  | "Facebook"
  | "Instagram"
  | "TikTok"
  | "WhatsApp"
  | "Directo"
  | "Agencias"
  | "Taxis"
  | "Hotel"
  | "Pagina WEB"
  | "Google"
  | string;

export interface AdminReservationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  packageCode?: string;
  email?: string;
  reference?: string;
  from?: string;
  to?: string;
  sortBy?: ReservationSortBy;
  sortOrder?: ReservationSortOrder;
}

export interface ApiReservationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiReservationFilters {
  page?: number;
  limit?: number;
  search?: string | null;
  status?: string | null;
  packageCode?: string | null;
  email?: string | null;
  reference?: string | null;
  from?: string | null;
  to?: string | null;
  sortBy?: ReservationSortBy;
  sortOrder?: ReservationSortOrder;
}

export interface ApiReservationsSummary {
  total: number;
  byStatus: Record<string, number>;
}

export interface ApiReservationPassengers {
  adults: number;
  children: number;
  infants: number;
  inapamVisitors?: number;
}

export interface ApiReservationCustomer {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  comments?: string | null;
}

export interface ApiReservationPackage {
  id?: string;
  code?: string | null;
  currency?: string | null;
  coverMedia?: unknown;
}

export interface ApiReservationPricing {
  peopleSubtotalMXN?: number | string | null;
  subtotalMXN?: number | string | null;
  extrasMXN?: number | string | null;
  discountMXN?: number | string | null;
  campaignDiscountMXN?: number | string | null;
  couponDiscountMXN?: number | string | null;
  inapamDiscountMXN?: number | string | null;
  totalMXN?: number | string | null;
  currency?: string | null;
}

export interface ApiReservationCampaign {
  campaignCode?: string | null;
  appliedCampaignCodes?: string[] | string | null;
}

export interface ApiReservationCoupon {
  couponCode?: string | null;
  couponDiscountMXN?: number | string | null;
}

export interface ApiReservationAttribution {
  reference?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  fbclid?: string | null;
  ttclid?: string | null;
  gclid?: string | null;
  landingPage?: string | null;
  referrer?: string | null;
}

export interface ApiReservationExtra {
  id?: string;
  code?: string;
  qty?: number;
  priceMXN?: number | string | null;
  currency?: string | null;
  name?: string | null;
  description?: string | null;
}

export interface ApiReservationPayment {
  id?: string;
  provider?: string | null;
  method?: string | null;
  status?: string | null;
  amountMXN?: number | string | null;
  reference?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface ApiReservation {
  id: string;
  folio: string;
  status: ReservationStatus;
  visitDate: string;

  reference?: string | null;
  attribution?: ApiReservationAttribution | null;

  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  fbclid?: string | null;
  ttclid?: string | null;
  gclid?: string | null;
  landingPage?: string | null;
  referrer?: string | null;

  passengers?: ApiReservationPassengers | null;
  customer?: ApiReservationCustomer | null;
  package?: ApiReservationPackage | null;
  pricing?: ApiReservationPricing | null;
  campaign?: ApiReservationCampaign | null;
  coupon?: ApiReservationCoupon | null;
  extras?: ApiReservationExtra[];
  payments?: ApiReservationPayment[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ApiReservationsListResponse {
  success: boolean;
  message: string;
  filters?: ApiReservationFilters;
  pagination: ApiReservationPagination;
  summary: ApiReservationsSummary;
  data: ApiReservation[];
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
}

export const reservationStatusOptions = [
  "DRAFT",
  "PROCESSING_PAYMENT",
  "PAID",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "REFUNDED",
];

export const reservationReferenceOptions = [
  "Facebook",
  "Instagram",
  "TikTok",
  "WhatsApp",
  "Directo",
  "Agencias",
  "Taxis",
  "Hotel",
  "Pagina WEB",
  "Google",
];

export function getReservationStatusLabel(status?: string | null) {
  switch (String(status || "").toUpperCase()) {
    case "DRAFT":
      return "Borrador";
    case "PROCESSING_PAYMENT":
      return "Procesando pago";
    case "PAID":
      return "Pagada";
    case "COMPLETED":
      return "Completada";
    case "CANCELLED":
      return "Cancelada";
    case "NO_SHOW":
      return "No show";
    case "REFUNDED":
      return "Reembolsada";
    default:
      return status || "Sin estado";
  }
}
export type BookingLocale = "es" | "en";

export interface BookingExtraInput {
  code: string;
  qty: number;
}

export interface ReservationQuoteRequest {
  packageCode: string;
  visitDate: string;
  adults: number;
  children: number;
  infants: number;
  inapamVisitors: number;
  couponCode?: string;
  campaignCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  ttclid?: string;
  lang: BookingLocale;
  extras?: BookingExtraInput[];
}

export interface ReservationQuotePackageInfo {
  id: string;
  code: string;
  currency: string;
  coverMedia: string | null;
}

export interface ReservationQuotePricing {
  adultPriceMXN: number;
  childPriceMXN: number;
  infantPriceMXN: number;
  adultsTotalMXN: number;
  childrenTotalMXN: number;
  infantsTotalMXN: number;
  peopleSubtotalMXN: number;
  extrasMXN: number;
  subtotalMXN: number;
  inapamPercent: number;
  inapamVisitors: number;
  inapamDiscountMXN: number;
  couponDiscountMXN: number;
  discountMXN: number;
  totalMXN: number;
}

export interface ReservationQuotePassengers {
  adults: number;
  children: number;
  infants: number;
}

export interface ReservationQuoteCoupon {
  code: string;
  type: string;
  value: number;
  scope: string;
}

export interface ReservationQuoteSnapshot {
  lang: BookingLocale;
  name: string;
  description: string;
  includes: string[];
  excludes: string[];
  notes: string[];
  ageRules: {
    adultMin: number;
    childMax: number;
    childMin: number;
    infantMax: number;
  };
}

export interface ReservationQuoteData {
  package: ReservationQuotePackageInfo;
  pricing: ReservationQuotePricing;
  passengers: ReservationQuotePassengers;
  extras: BookingExtraInput[];
  coupon?: ReservationQuoteCoupon | null;
  snapshot: ReservationQuoteSnapshot;
}

export interface ReservationQuoteResponse {
  success: boolean;
  message: string;
  data: ReservationQuoteData;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
}

export interface ReservationCreateRequest {
  packageCode: string;
  visitDate: string;
  adults: number;
  children: number;
  infants: number;
  inapamVisitors: number;
  couponCode?: string;
  campaignCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  ttclid?: string;
  lang: BookingLocale;
  extras?: BookingExtraInput[];
}

export interface ReservationPackageRecord {
  id: string;
  code: string;
  isActive: boolean;
  adultPriceMXN: number;
  childPriceMXN: number;
  infantPriceMXN: number;
  currency: string;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  ageRules: {
    adultMin: number;
    childMax: number;
    childMin: number;
    infantMax: number;
  };
  coverMediaId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationRecord {
  id: string;
  folio: string;
  packageId: string;
  visitDate: string;
  adults: number;
  children: number;
  infants: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  comments: string | null;
  campaignCode?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  fbclid?: string | null;
  ttclid?: string | null;
  couponCode?: string | null;
  couponDiscountMXN?: number;
  inapamVisitors: number;
  inapamDiscountMXN?: number;
  discountMXN?: number;
  subtotalMXN: number;
  extrasMXN: number;
  totalMXN: number;
  currency: string;
  status: string;
  snapshotLang?: BookingLocale;
  snapshotName?: string;
  snapshotDescription?: string;
  snapshotIncludes?: string[];
  snapshotExcludes?: string[];
  snapshotNotes?: string[];
  snapshotAgeRules?: {
    adultMin: number;
    childMax: number;
    childMin: number;
    infantMax: number;
  };
  createdAt: string;
  updatedAt: string;
  extras: BookingExtraInput[];
  package?: ReservationPackageRecord;
}

export interface ReservationCreateResponse {
  success: boolean;
  message: string;
  data: ReservationRecord;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
}

export interface ReservationGetResponse {
  success: boolean;
  message: string;
  data: ReservationRecord;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
}

export interface ReservationContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  comments?: string;
}

export interface ReservationContactResponse {
  success: boolean;
  message: string;
  data: ReservationRecord;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
}

export type PaymentMethodType = "card" | "oxxo";

export type PaymentStatusType =
  | "DRAFT"
  | "PENDING"
  | "REQUIRES_PAYMENT_METHOD"
  | "PROCESSING"
  | "PAID"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED";

export interface PaymentIntentRequest {
  folio: string;
  method?: PaymentMethodType;
}

export interface StripeIntentInfo {
  paymentIntentId?: string;
  clientSecret?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paymentMethodType?: PaymentMethodType;
}

export interface OxxoPaymentInfo {
  hostedVoucherUrl?: string | null;
  number?: string | null;
  expiresAfter?: number | null;
  expiresAfterDays?: number | null;
}

export interface PaymentIntentData {
  folio: string;
  status: string;
  currency?: string;
  totalMXN?: number;
  reservationId?: string;
  stripe?: StripeIntentInfo;
  paymentMethod?: PaymentMethodType;
  reference?: string | null;
  expiresAt?: string | null;
  hostedVoucherUrl?: string | null;
  oxxo?: OxxoPaymentInfo | null;
  message?: string | null;
}

export interface PaymentIntentResponse {
  success: boolean;
  message: string;
  data: PaymentIntentData;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
}

export interface BookingDraftStorage {
  signature: string;
  currentStep: 1 | 2 | 3 | 4;
  folio: string;
  reservation: ReservationRecord | null;
  quote: ReservationQuoteData | null;
  paymentIntent: PaymentIntentData | null;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    comments: string;
    acceptedTerms: boolean;
    acceptedPrivacy: boolean;
  };
  updatedAt: string;
}
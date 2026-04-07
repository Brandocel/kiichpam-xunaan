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
  coverMedia?: {
    id: string;
    url: string;
    mimeType: string;
  } | null;
}

export interface ReservationQuotePricing {
  adultPriceMXN: number;
  childPriceMXN: number;
  infantPriceMXN: number;

  campaignAdultTotalMXN: number;
  campaignChildTotalMXN: number;
  campaignInfantTotalMXN: number;

  peopleSubtotalMXN: number;
  peopleSubtotalWithCampaignMXN: number;
  campaignDiscountMXN: number;

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
  payableAdults: number;
  payableChildren: number;
  payableInfants: number;
}

export interface ReservationQuoteCoupon {
  code: string;
  type: string;
  value: number;
  scope: string;
}

export interface ReservationQuoteCampaignItem {
  id?: string;
  code: string;
  name: string;
  category: string;
  ruleType: string;
  priority: number;
  audience: string;
  stackable?: boolean;
}

export interface ReservationQuoteCampaigns {
  primaryCampaignCode: string | null;
  appliedCampaignCodes: string[];
  appliedCampaigns: ReservationQuoteCampaignItem[];
}

export interface ReservationQuoteRules {
  order: string[];
  campaignResolvedByBackend: boolean;
  couponValidatedAgainstCampaign: boolean;
}

export interface ReservationQuoteBreakdown {
  basePeopleSubtotalMXN: number;
  peopleSubtotalWithCampaignMXN: number;
  extrasMXN: number;
  subtotalBeforeDiscountsMXN: number;
  subtotalAfterInapamMXN: number;
  totalMXN: number;
}

export interface ReservationQuoteSnapshot {
  lang: BookingLocale;
  name: string;
  description: string | null;
  includes: string[];
  excludes: string[];
  notes: string[];
  ageRules: {
    adultMin: number;
    childMax: number;
    childMin: number;
    infantMax: number;
  } | null;
}

export interface ReservationQuoteData {
  package: ReservationQuotePackageInfo;
  pricing: ReservationQuotePricing;
  passengers: ReservationQuotePassengers;
  extras: Array<{
    code: string;
    qty: number;
    priceMXN?: number;
    currency?: string;
    name?: string | null;
    description?: string | null;
  }>;
  campaigns: ReservationQuoteCampaigns;
  coupon?: ReservationQuoteCoupon | null;
  rules: ReservationQuoteRules;
  breakdown: ReservationQuoteBreakdown;
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
  maxAdults: number | null;
  maxChildren: number | null;
  maxInfants: number | null;
  ageRules: {
    adultMin: number;
    childMax: number;
    childMin: number;
    infantMax: number;
  } | null;
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
  appliedCampaignCodes?: string[] | null;

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

  campaignDiscountMXN?: number;
  discountMXN?: number;

  peopleSubtotalMXN?: number;
  subtotalMXN: number;
  extrasMXN: number;
  totalMXN: number;

  pricingBreakdown?: ReservationQuoteBreakdown | null;

  currency: string;
  status: string;

  snapshotLang?: BookingLocale;
  snapshotName?: string;
  snapshotDescription?: string | null;
  snapshotIncludes?: string[];
  snapshotExcludes?: string[];
  snapshotNotes?: string[];
  snapshotAgeRules?: {
    adultMin: number;
    childMax: number;
    childMin: number;
    infantMax: number;
  } | null;

  createdAt: string;
  updatedAt: string;

  extras: Array<{
    code: string;
    qty: number;
    priceMXN?: number;
    currency?: string;
    name?: string | null;
    description?: string | null;
  }>;

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
  form: {
    packageCode: string;
    visitDate: string;
    adults: number;
    children: number;
    infants: number;
    inapamVisitors: number;
    couponCode: string;
    extras: BookingExtraInput[];
    locale: BookingLocale;
  };
  reservation: {
    folio: string;
    currentStep: 1 | 2 | 3 | 4;
    data: ReservationRecord | null;
    quote: ReservationQuoteData | null;
    paymentIntent: PaymentIntentData | null;
    quoteSignature: string;
  };
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
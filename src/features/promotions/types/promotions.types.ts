export type PromotionSectionType = "MONTHLY" | "STANDARD";

export type PromotionLocale = "es" | "en";

export interface PromotionTranslation {
  id?: string;
  lang: PromotionLocale | string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  buttonText?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionMedia {
  id: string;
  kind?: string;
  mimeType: string;
  ext?: string;
  size?: number;
  originalName?: string;
  filename?: string;
  path?: string;
  url: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionPackageTranslation {
  id?: string;
  lang?: string;
  name?: string;
  description?: string | null;
  includes?: unknown;
  excludes?: unknown;
  notes?: unknown;
}

export interface PromotionPackage {
  id?: string;
  webCode?: number;
  codigoWeb?: number;
  code?: string;
  isActive?: boolean;

  adultPriceMXN?: number;
  childPriceMXN?: number;
  infantPriceMXN?: number;
  inapamPriceMXN?: number | null;

  currency?: string;

  maxAdults?: number | null;
  maxChildren?: number | null;
  maxInfants?: number | null;

  ageRules?: unknown;

  translations?: PromotionPackageTranslation[];
  translation?: PromotionPackageTranslation | null;

  coverMedia?: PromotionMedia | null;
  image?: PromotionMedia | null;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

export interface PromotionCampaignTranslation {
  id?: string;
  campaignId?: string;
  lang?: string;

  promoName?: string | null;
  promoDescription?: string | null;

  addIncludes?: unknown;
  removeIncludes?: unknown;

  addExcludes?: unknown;
  removeExcludes?: unknown;

  addNotes?: unknown;
  removeNotes?: unknown;

  imageMediaId?: string | null;
  imageMedia?: PromotionMedia | null;

  effectMode?: string;
}

export interface PromotionCampaign {
  id?: string;
  code?: string;
  name?: string;
  source?: string | null;
  isActive?: boolean;

  packageId?: string | null;
  description?: string | null;

  status?: string;
  category?: string;
  ruleType?: string;
  audience?: string;

  startAt?: string | null;
  endAt?: string | null;

  priority?: number;
  autoApply?: boolean;
  stackable?: boolean;

  fixedAdultPriceMXN?: number | null;
  fixedChildPriceMXN?: number | null;
  fixedInfantPriceMXN?: number | null;
  fixedInapamPriceMXN?: number | null;

  discountPercent?: number | null;

  payQty?: number | null;
  takeQty?: number | null;

  minAdults?: number | null;
  minChildren?: number | null;
  minInfants?: number | null;

  maxUses?: number | null;
  usedCount?: number;

  translations?: PromotionCampaignTranslation[];
  translation?: PromotionCampaignTranslation | null;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

export interface PromotionItem {
  id: string;
  code: string;
  isActive: boolean;
  sectionType: PromotionSectionType;

  title: string;
  subtitle?: string | null;
  description?: string | null;

  buttonText?: string | null;
  buttonUrl?: string | null;

  order: number;
  priority: number;

  startAt?: string | null;
  endAt?: string | null;

  packageId?: string | null;
  campaignId?: string | null;
  imageMediaId?: string | null;

  package?: PromotionPackage | null;
  campaign?: PromotionCampaign | null;
  imageMedia?: PromotionMedia | null;

  translation?: PromotionTranslation | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionsPublicResponseData {
  featuredPromotion: PromotionItem | null;
  promotions: PromotionItem[];
}

export interface PromotionsPublicApiResponse {
  success: boolean;
  message?: string;
  data?: PromotionsPublicResponseData;
  meta?: {
    timestamp?: string;
    path?: string;
    method?: string;
  };
}
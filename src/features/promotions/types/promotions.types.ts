export type Locale = "es" | "en";

export type PromotionSectionType = "MONTHLY" | "STANDARD";

export interface PromotionMedia {
  id: string;
  url: string;
  originalName?: string;
  altText?: string;
}

export interface PromotionPackage {
  id: string;
  code: string;
  currency?: string;
  translation?: {
    lang: string;
    name: string;
    description?: string | null;
  } | null;
}

export interface PromotionCampaign {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  ruleType?: string;
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
}

export interface PromotionsPublicResponseData {
  featuredPromotion: PromotionItem | null;
  promotions: PromotionItem[];
}

export interface PromotionsPublicApiResponse {
  success: boolean;
  message: string;
  data: PromotionsPublicResponseData;
}
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

export interface PromotionItem {
  id: string;
  code: string;
  isActive: boolean;
  sectionType: "MONTHLY" | "STANDARD";
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
  imageMedia?: PromotionMedia | null;
  package?: {
    id?: string;
    code?: string;
    [key: string]: unknown;
  } | null;
  campaign?: {
    id?: string;
    code?: string;
    [key: string]: unknown;
  } | null;
  translation?: PromotionTranslation | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionsPublicApiResponse {
  success: boolean;
  message?: string;
  data?: {
    featuredPromotion: PromotionItem | null;
    promotions: PromotionItem[];
  };
  meta?: {
    timestamp?: string;
    path?: string;
    method?: string;
  };
}
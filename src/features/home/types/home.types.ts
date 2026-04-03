export interface HeroMedia {
  id: string;
  url: string;
  mimeType: string;
  isActive: boolean;
}

export interface HeroSlide {
  id: string;
  order: number;
  isActive: boolean;
  title: string;
  subtitle: string;
  linkUrl: string;
  linkText: string;
  altText: string;
  media: HeroMedia;
}

export interface HeroSlidesResponse {
  success: boolean;
  message: string;
  data: HeroSlide[];
}

export interface PackageAgeRules {
  adultMin: number;
  childMax: number;
  childMin: number;
  infantMax: number;
}

export interface PackageTranslation {
  lang: "es" | "en";
  name: string;
  description: string;
  includes: string[];
  excludes: string[];
  notes: string[];
}

export interface PackageItem {
  id: string;
  code: "KX_BASIC" | "KX_PLUS" | "KX_TOTAL" | string;
  isActive: boolean;
  image: string | null;
  adultPriceMXN: number;
  childPriceMXN: number;
  infantPriceMXN: number;
  currency: string;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  ageRules: PackageAgeRules;
  translation: PackageTranslation;
  extras: unknown[];
}

export interface PackagesResponse {
  success: boolean;
  message: string;
  data: PackageItem[];
  meta: {
    timestamp: string;
    path: string;
    method: string;
  };
}
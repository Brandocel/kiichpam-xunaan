export interface ProposalHeroSlide {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
  imageUrl: string;
  imageAlt: string;
  order: number;
  isActive: boolean;
}

export interface ProposalHeroResponse {
  success: boolean;
  data: ProposalHeroSlide[];
}

export interface ProposalPackageItem {
  buttonHref: string;
  id: string;
  code: string;
  title: string;
  description?: string;
  includes: string[];
  excludes: string[];
  buttonText: string;
  highlighted?: boolean;
  order: number;
  isActive: boolean;
}

export interface ProposalPackagesResponse {
  success: boolean;
  data: ProposalPackageItem[];
}

export interface ProposalGalleryItem {
  id: string;
  imageUrl: string;
  alt: string;
  width?: number;
  height?: number;
  order: number;
  isActive: boolean;
}

export interface ProposalGalleryResponse {
  success: boolean;
  data: ProposalGalleryItem[];
}
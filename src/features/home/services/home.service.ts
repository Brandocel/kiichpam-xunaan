import type {
  HeroSlide,
  HeroSlidesResponse,
  PackageItem,
  PackagesResponse,
} from "../types/home.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Locale = "es" | "en";

function getSafeApiBaseUrl() {
  if (!API_BASE_URL) {
    console.error("NEXT_PUBLIC_API_URL no está configurada");
    return "";
  }

  return API_BASE_URL.replace(/\/$/, "");
}

export async function getHeroSlides(lang: Locale = "es"): Promise<HeroSlide[]> {
  try {
    const baseUrl = getSafeApiBaseUrl();

    if (!baseUrl) {
      return [];
    }

    const params = new URLSearchParams({
      lang,
      isActive: "true",
    });

    const response = await fetch(`${baseUrl}/hero/slides?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("HERO STATUS ERROR:", response.status);
      return [];
    }

    const result: HeroSlidesResponse = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      return [];
    }

    return result.data
      .filter((slide) => slide.isActive && slide.media?.isActive)
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("GET HERO ERROR:", error);
    return [];
  }
}

export async function getPackages(lang: Locale = "es"): Promise<PackageItem[]> {
  try {
    const baseUrl = getSafeApiBaseUrl();

    if (!baseUrl) {
      return [];
    }

    const params = new URLSearchParams({
      lang,
    });

    const response = await fetch(`${baseUrl}/packages?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("PACKAGES STATUS ERROR:", response.status);
      return [];
    }

    const result: PackagesResponse = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      return [];
    }

    const orderMap: Record<string, number> = {
      KX_BASIC: 1,
      KX_PLUS: 2,
      KX_TOTAL: 3,
    };

    return result.data
      .filter((item) => item.isActive)
      .sort((a, b) => (orderMap[a.code] || 99) - (orderMap[b.code] || 99));
  } catch (error) {
    console.error("GET PACKAGES ERROR:", error);
    return [];
  }
}
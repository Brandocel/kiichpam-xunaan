import type {
  HeroSlide,
  HeroSlidesResponse,
  PackageItem,
  PackagesResponse,
} from "../types/home.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/hero/slides`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("STATUS ERROR:", response.status);
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

export async function getPackages(
  lang: "es" | "en"
): Promise<PackageItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/packages?lang=${lang}`, {
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
import type {
  PromotionItem,
  PromotionsPublicApiResponse,
} from "../types/promotions.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Locale = "es" | "en";

function getSafeApiBaseUrl() {
  if (!API_BASE_URL) {
    console.error("NEXT_PUBLIC_API_URL no está configurada");
    return "";
  }

  return API_BASE_URL.replace(/\/$/, "");
}

function isPromotionActiveByDate(promotion: PromotionItem) {
  const now = new Date();

  if (promotion.startAt) {
    const startAt = new Date(promotion.startAt);

    if (startAt > now) {
      return false;
    }
  }

  if (promotion.endAt) {
    const endAt = new Date(promotion.endAt);

    if (endAt < now) {
      return false;
    }
  }

  return true;
}

function sortPromotions(promotions: PromotionItem[]) {
  return [...promotions].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }

    if (a.order !== b.order) {
      return a.order - b.order;
    }

    return (a.title || "").localeCompare(b.title || "");
  });
}

export async function getPublicPromotions(
  locale: Locale = "es",
): Promise<{
  featuredPromotion: PromotionItem | null;
  promotions: PromotionItem[];
}> {
  try {
    const baseUrl = getSafeApiBaseUrl();

    if (!baseUrl) {
      return {
        featuredPromotion: null,
        promotions: [],
      };
    }

    const params = new URLSearchParams({
      lang: locale,
    });

    const response = await fetch(
      `${baseUrl}/promotions/public?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("PROMOTIONS STATUS ERROR:", response.status);

      return {
        featuredPromotion: null,
        promotions: [],
      };
    }

    const result: PromotionsPublicApiResponse = await response.json();

    if (!result.success || !result.data) {
      return {
        featuredPromotion: null,
        promotions: [],
      };
    }

    const featuredFromApi = result.data.featuredPromotion ?? null;

    const promotionsFromApi = Array.isArray(result.data.promotions)
      ? result.data.promotions
      : [];

    const activePromotions = promotionsFromApi.filter(
      (promotion: PromotionItem) =>
        promotion.isActive && isPromotionActiveByDate(promotion),
    );

    const sortedPromotions = sortPromotions(activePromotions);

    if (
      featuredFromApi &&
      featuredFromApi.isActive &&
      isPromotionActiveByDate(featuredFromApi)
    ) {
      return {
        featuredPromotion: featuredFromApi,
        promotions: sortedPromotions.filter(
          (promotion) => promotion.id !== featuredFromApi.id,
        ),
      };
    }

    const [fallbackFeaturedPromotion, ...restPromotions] = sortedPromotions;

    return {
      featuredPromotion: fallbackFeaturedPromotion ?? null,
      promotions: restPromotions,
    };
  } catch (error) {
    console.error("GET PROMOTIONS ERROR:", error);

    return {
      featuredPromotion: null,
      promotions: [],
    };
  }
}
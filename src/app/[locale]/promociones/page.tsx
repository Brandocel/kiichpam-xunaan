import {
  getPublicPromotions,
  PromotionsPageView,
} from "@/features/promotions";
import { getPackages } from "@/features/home/services/home.service";

type Locale = "es" | "en";

interface PromotionsPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

function normalizeLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "es";
}

export default async function PromotionsPage({
  params,
}: PromotionsPageProps) {
  const resolvedParams = await params;
  const locale = normalizeLocale(resolvedParams.locale);

  const [{ featuredPromotion, promotions }, packages] = await Promise.all([
    getPublicPromotions(locale),
    getPackages(locale),
  ]);

  return (
    <PromotionsPageView
      locale={locale}
      packages={packages}
      featuredPromotion={featuredPromotion}
      promotions={promotions}
    />
  );
}
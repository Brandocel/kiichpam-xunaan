import {
  getPublicPromotions,
  PromotionsPageView,
} from "@/features/promotions";
import { getPackages } from "@/features/home/services/home.service";

interface PromotionsPageProps {
  params: Promise<{
    locale: "es" | "en";
  }>;
}

export default async function PromotionsPage({ params }: PromotionsPageProps) {
  const { locale } = await params;

  const [{ featuredPromotion, promotions }, packages] = await Promise.all([
    getPublicPromotions(),
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
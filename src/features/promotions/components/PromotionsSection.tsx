"use client";

import type { PromotionItem } from "../types/promotions.types";
import PromotionCard from "./PromotionCard";

interface PromotionsSectionProps {
  locale: "es" | "en";
  featuredPromotion: PromotionItem | null;
  promotions: PromotionItem[];
  onReserve?: (promotion: PromotionItem) => void;
}

const emptyContent = {
  es: {
    title: "No hay promociones disponibles",
    description: "Muy pronto tendremos nuevas promociones para ti.",
  },
  en: {
    title: "No promotions available",
    description: "New promotions will be available soon.",
  },
};

export default function PromotionsSection({
  locale,
  featuredPromotion,
  promotions,
  onReserve,
}: PromotionsSectionProps) {
  const isEmpty = !featuredPromotion && promotions.length === 0;

  return (
    <section
      className="
        relative w-full overflow-hidden
        bg-[linear-gradient(180deg,#0B3F67_0%,#005F73_45%,#006A78_100%)]
      "
    >
      <div
        className="
          pointer-events-none absolute inset-0 z-0
          bg-[url('/promotions/TexturaKXXN.png')]
          bg-repeat
          bg-[length:170px_auto]
          opacity-[0.28]
        "
      />

      <div
        className="
          pointer-events-none absolute inset-0 z-[1]
          bg-[linear-gradient(180deg,rgba(0,95,115,0.82)_0%,rgba(0,95,115,0.72)_45%,rgba(0,106,120,0.64)_100%)]
        "
      />

      <div className="relative z-[2] mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-8 md:px-10 lg:px-14 xl:px-16">
        {isEmpty ? (
          <div className="mx-auto max-w-[760px] rounded-[18px] bg-white/10 px-6 py-12 text-center text-white backdrop-blur-sm">
            <h2 className="font-[var(--font-poppins)] text-[28px] font-black sm:text-[34px]">
              {emptyContent[locale].title}
            </h2>

            <p className="mt-3 font-[var(--font-poppins)] text-[16px] text-white/90 sm:text-[18px]">
              {emptyContent[locale].description}
            </p>
          </div>
        ) : (
          <>
            {featuredPromotion && (
              <PromotionCard
                promotion={featuredPromotion}
                locale={locale}
                featured
                onReserve={onReserve}
              />
            )}

            {featuredPromotion && promotions.length > 0 && (
              <div className="mx-auto my-20 h-px w-full max-w-[1320px] bg-white/90" />
            )}

            {promotions.length > 0 && (
              <div className="flex flex-col gap-20">
                {promotions.map((promotion) => (
                  <PromotionCard
                    key={promotion.id}
                    promotion={promotion}
                    locale={locale}
                    onReserve={onReserve}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
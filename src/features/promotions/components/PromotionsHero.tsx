"use client";

import Image from "next/image";
import Header from "../../../shared/components/layout/Header";

interface PromotionsHeroProps {
  locale: "es" | "en";
}

const content = {
  es: {
    title: "Promociones para todos",
    image: "/promotions/promotionheader.webp",
    alt: "Cenote Kiichpam Xunáan promociones",
  },
  en: {
    title: "Promotions for everyone",
    image: "/promotions/promotionheader.webp",
    alt: "Kiichpam Xunáan cenote promotions",
  },
};

export default function PromotionsHero({ locale }: PromotionsHeroProps) {
  const t = content[locale];

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <Header locale={locale} variant="overlay" />

      <div className="relative h-[430px] w-full sm:h-[470px] md:h-[520px] lg:h-[560px] xl:h-[590px]">
        <Image
          src={t.image}
          alt={t.alt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        <div className="absolute inset-0 z-[1] bg-black/50" />

        <div className="relative z-[2] flex h-full items-center justify-center px-4 pt-[95px] text-center sm:px-6 sm:pt-[105px] md:px-8 md:pt-[115px] lg:pt-[120px]">
          <div className="w-full max-w-[1320px] px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:px-10 lg:py-6">
            <h1
              className="mx-auto max-w-[1320px] text-[26px] font-black leading-[1.1] tracking-[-0.01em] text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.95)] sm:text-[32px] md:text-[38px] lg:text-[42px] xl:text-[46px]"
              style={{
                fontFamily:
                  '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {t.title}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
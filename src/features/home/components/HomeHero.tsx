"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { HeroSlide } from "../types/home.types";
import { buildMediaUrl } from "../../../shared/lib/utils";
import HeroPagination from "./HeroPagination";
import Header from "../../../shared/components/layout/Header";

interface HomeHeroProps {
  slides: HeroSlide[];
  locale?: "es" | "en";
}

export default function HomeHero({ slides, locale = "es" }: HomeHeroProps) {
  const validSlides = useMemo(
    () => slides.filter((slide) => slide?.media?.url),
    [slides],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (validSlides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % validSlides.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [validSlides.length]);

  if (!validSlides.length) {
    return null;
  }

  const activeSlide = validSlides[activeIndex];
  const imageUrl = buildMediaUrl(activeSlide.media.url);

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? validSlides.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % validSlides.length);
  };

  return (
    <section className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-[#005F73] md:min-h-[720px]">
      <Image
        src={imageUrl}
        alt={activeSlide.altText || activeSlide.title || "Kiichpam Xunaan"}
        fill
        priority={activeIndex === 0}
        quality={72}
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-0 z-[1] bg-black/25" />

      <Header locale={locale} />

      {validSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={locale === "es" ? "Slide anterior" : "Previous slide"}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 text-white/80 transition hover:text-white md:left-6 xl:left-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 md:h-12 md:w-12"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label={locale === "es" ? "Siguiente slide" : "Next slide"}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 text-white/80 transition hover:text-white md:right-6 xl:right-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 md:h-12 md:w-12"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 md:px-10">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
          <h1 className="max-w-[950px] text-balance text-[clamp(2.8rem,7vw,6.7rem)] font-bold leading-[0.95] tracking-[-0.02em] text-white">
            {activeSlide.title}
          </h1>

          <p className="mt-4 max-w-[900px] text-balance text-[clamp(1rem,2.1vw,1.9rem)] font-normal leading-[1.2] text-white md:mt-5">
            {activeSlide.subtitle}
          </p>
        </div>
      </div>

      {validSlides.length > 1 && (
        <HeroPagination
          total={validSlides.length}
          active={activeIndex}
          onChange={setActiveIndex}
          bottomOffset={34}
          dotSize={10}
          gap={14}
          pillHeight={10}
        />
      )}
    </section>
  );
}
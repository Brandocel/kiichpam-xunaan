import Image from "next/image";
import Header from "../../../shared/components/layout/Header";
import type { CenotesHeroContent } from "../types/cenotes.types";

interface CenotesHeroProps {
  hero: CenotesHeroContent;
  locale: "es" | "en";
}

export default function CenotesHero({ hero, locale }: CenotesHeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <Header locale={locale} variant="overlay" />

      <div className="relative h-[520px] w-full sm:h-[580px] md:h-[650px] lg:h-[720px] xl:h-[760px]">
        <Image
          src={hero.backgroundImage}
          alt={hero.title}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        <div className="absolute inset-0 z-[1] bg-black/45" />

        <div className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(192,40,185,0.46)_0%,rgba(0,0,0,0.28)_45%,rgba(0,0,0,0.50)_100%)]" />

        <div className="absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.28)_55%,rgba(0,0,0,0.48)_100%)]" />

        <div className="relative z-[4] flex h-full items-center justify-center px-4 pt-[82px] sm:px-6 sm:pt-[88px] md:px-8 md:pt-[92px] lg:pt-[96px]">
          <div className="w-full max-w-[1500px] text-center">
            <h1
              className="
                mx-auto max-w-[1450px]
                whitespace-nowrap
                text-[24px] font-black leading-[1.05]
                tracking-[-0.02em] text-white
                drop-shadow-[0_4px_12px_rgba(0,0,0,0.65)]
                sm:text-[30px]
                md:text-[36px]
                lg:text-[42px]
                xl:text-[48px]
              "
              style={{
                fontFamily:
                  '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {hero.title}
            </h1>

            <p
              className="
                mx-auto mt-4 max-w-[1100px]
                text-[13px] font-normal leading-[1.35]
                tracking-[-0.01em] text-white
                drop-shadow-[0_3px_10px_rgba(0,0,0,0.70)]
                sm:text-[15px]
                md:text-[17px]
                lg:text-[20px]
              "
              style={{
                fontFamily:
                  '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {hero.subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
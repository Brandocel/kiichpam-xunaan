"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "../../../shared/components/layout/Header";
import type { ProposalHeroSlide } from "../types/proposal.types";

interface ProposalHeroProps {
  slides: ProposalHeroSlide[];
  locale: "es" | "en";
}

const fallbackContent = {
  es: {
    title: "Haz de tu momento más especial algo mágico",
    subtitle:
      'Vive una pedida de mano inolvidable en un cenote de Yucatán, rodeado de naturaleza, agua cristalina y un ambiente único que hará de tu “Sí” un recuerdo para siempre.',
    buttonText: "Más información",
    buttonHref: "/es/contacto",
    imageUrl: "/pedida-mano/hero.webp",
    imageAlt: "Pedida de mano en cenote",
  },
  en: {
    title: "Make your most special moment truly magical",
    subtitle:
      'Live an unforgettable proposal in a cenote in Yucatán, surrounded by nature, crystal-clear water, and a unique atmosphere that will make your “Yes” a memory forever.',
    buttonText: "More information",
    buttonHref: "/en/contacto",
    imageUrl: "/pedida-mano/hero.webp",
    imageAlt: "Marriage proposal in cenote",
  },
};

export default function ProposalHero({
  slides,
  locale,
}: ProposalHeroProps) {
  const slide = slides?.[0];

  const content = {
    title: slide?.title || fallbackContent[locale].title,
    subtitle: slide?.subtitle || fallbackContent[locale].subtitle,
    buttonText: slide?.buttonText || fallbackContent[locale].buttonText,
    buttonHref: slide?.buttonHref || fallbackContent[locale].buttonHref,
    imageUrl: slide?.imageUrl || fallbackContent[locale].imageUrl,
    imageAlt: slide?.imageAlt || fallbackContent[locale].imageAlt,
  };

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <Header locale={locale} variant="overlay" />

      <div className="relative h-[520px] w-full sm:h-[580px] md:h-[650px] lg:h-[720px] xl:h-[760px]">
        <Image
          src={content.imageUrl}
          alt={content.imageAlt}
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 z-[1] bg-black/45" />

        <div className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(0,0,0,0.40)_0%,rgba(0,0,0,0.30)_20%,rgba(0,0,0,0.45)_100%)]" />

        <div className="relative z-[3] flex h-full items-center justify-center px-4 pt-[120px] sm:px-6 sm:pt-[130px] md:px-8 md:pt-[140px]">
          <div
            className="
              w-full max-w-[1030px]
              px-4 py-5
              sm:px-6 sm:py-6
              md:px-8 md:py-7
              lg:px-10 lg:py-8
              text-center
            "
          >
            <h1
              className="
                mx-auto max-w-[1030px]
                text-white
                text-[28px]
                font-black
                leading-[1.15]
                tracking-[-0.01em]
                sm:text-[34px]
                md:text-[40px]
                lg:text-[48px]
              "
              style={{
                fontFamily:
                  '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {content.title}
            </h1>

            <p
              className="
                mx-auto mt-3 max-w-[1030px]
                text-white
                text-[14px]
                font-medium
                leading-[1.48]
                tracking-[-0.01em]
                sm:text-[15px]
                md:text-[18px]
                lg:text-[20px]
              "
              style={{
                fontFamily:
                  '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {content.subtitle}
            </p>

            <Link
              href={content.buttonHref}
              className="
                mt-5 inline-flex min-h-[41px] min-w-[160px]
                items-center justify-center
                rounded-[7px]
                px-[20px] py-[10px]
                text-center text-[14px]
                font-black text-white
                transition-all duration-300
                hover:brightness-110
                active:scale-[0.98]
                sm:min-w-[180px] sm:text-[15px]
                md:min-w-[204px]
              "
              style={{
                backgroundColor: "#C028B9",
                fontFamily:
                  '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {content.buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
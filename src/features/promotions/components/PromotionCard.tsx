"use client";

import Image from "next/image";
import type { PromotionItem } from "../types/promotions.types";

interface PromotionCardProps {
  promotion: PromotionItem;
  locale: "es" | "en";
  featured?: boolean;
  onReserve?: (promotion: PromotionItem) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const fallbackImage = "/promociones/default.webp";

function resolveImageUrl(url?: string | null) {
  if (!url) return fallbackImage;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (!API_BASE_URL) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function getPromotionText(promotion: PromotionItem, locale: "es" | "en") {
  const translation =
    promotion.translation?.lang === locale ? promotion.translation : null;

  return {
    title: translation?.title || promotion.title || "",
    subtitle: translation?.subtitle || promotion.subtitle || "",
    description: translation?.description || promotion.description || "",
    buttonText:
      translation?.buttonText ||
      promotion.buttonText ||
      (locale === "es" ? "Reservar" : "Book now"),
  };
}

export default function PromotionCard({
  promotion,
  locale,
  featured = false,
  onReserve,
}: PromotionCardProps) {
  const imageUrl = resolveImageUrl(promotion.imageMedia?.url);
  const text = getPromotionText(promotion, locale);

  return (
    <article
      className={[
        "mx-auto grid w-full max-w-[1320px] items-center",
        "grid-cols-1 gap-8",
        featured
          ? "lg:grid-cols-[690px_597px] lg:gap-[42px]"
          : "lg:grid-cols-[520px_690px] lg:gap-[56px]",
      ].join(" ")}
    >
      <div
        className={[
          "relative w-full overflow-hidden rounded-[26px]",
          "shadow-[0_18px_38px_rgba(0,0,0,0.28)]",
          featured
            ? "h-[260px] sm:h-[310px] md:h-[350px] lg:h-[365px]"
            : "h-[330px] sm:h-[420px] md:h-[500px] lg:h-[520px]",
        ].join(" ")}
      >
        <Image
          src={imageUrl}
          alt={text.title || "Promotion"}
          fill
          unoptimized
          className="object-cover object-center"
          sizes={
            featured
              ? "(max-width: 1024px) 100vw, 690px"
              : "(max-width: 1024px) 100vw, 520px"
          }
        />
      </div>

      <div
        className={[
          "w-full text-white",
          featured ? "max-w-[597px]" : "max-w-[690px]",
        ].join(" ")}
      >
        <h2
          className="
            text-[30px] font-black leading-[150%] text-white
            sm:text-[34px]
            md:text-[36px]
          "
          style={{
            fontFamily:
              '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
          }}
        >
          {text.title}
        </h2>

        <div className="mt-1 w-full max-w-[568px]">
          {text.subtitle && (
            <p
              className="
                text-[16px] font-black leading-[150%] text-white
                sm:text-[18px]
              "
              style={{
                fontFamily:
                  '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {text.subtitle}
            </p>
          )}

          {text.description && (
            <p
              className="
                whitespace-pre-line
                text-[16px] font-normal leading-[150%] text-white
                sm:text-[18px]
                md:text-[20px]
              "
              style={{
                fontFamily:
                  '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {text.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onReserve?.(promotion)}
          className="
            mt-6 inline-flex h-[38px] w-[204px]
            items-center justify-center
            rounded-[7px]
            bg-[#C028B9]
            px-[15.56px] py-[4.24px]
            text-center
            text-[15px] font-black leading-[150%]
            text-white
            transition-all duration-300
            hover:brightness-110
            active:scale-[0.98]
          "
          style={{
            fontFamily:
              '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
            gap: "4.71px",
          }}
        >
          {text.buttonText}
        </button>
      </div>
    </article>
  );
}
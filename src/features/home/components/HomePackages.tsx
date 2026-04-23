"use client";

import Image from "next/image";
import Link from "next/link";
import patternBg from "../../../assets/Linemorada.webp";
import type { PackageItem } from "../types/home.types";
import { buildMediaUrl } from "../../../shared/lib/utils";

interface HomePackagesProps {
  packages: PackageItem[];
  locale: "es" | "en";
  onReserve?: (packageCode: string) => void;
}

const packageImageMap: Record<string, string> = {
  KX_BASIC: "/packages/kx-basic.webp",
  KX_PLUS: "/packages/kx-plus.webp",
  KX_TOTAL: "/packages/kx-total.webp",
};

function formatPrice(price: number) {
  return `$${(price / 100).toFixed(2)}`;
}

function getSectionTitle(locale: "es" | "en") {
  return locale === "es" ? "Elije tu paquete" : "Choose your package";
}

function getReserveText(locale: "es" | "en") {
  return locale === "es" ? "RESERVA AHORA" : "BOOK NOW";
}

function getAdultLabel(item: PackageItem, locale: "es" | "en") {
  return locale === "es"
    ? `Adulto (+${item.ageRules.adultMin} Años)`
    : `Adult (${item.ageRules.adultMin}+ Years)`;
}

function getCardImage(item: PackageItem) {
  if (item.image) {
    return buildMediaUrl(item.image);
  }

  return packageImageMap[item.code] || "/packages/kx-basic.webp";
}

function getReserveHref(locale: "es" | "en", packageCode: string) {
  return `/${locale}/reservar?packageCode=${encodeURIComponent(packageCode)}`;
}

function getNotesText(item: PackageItem) {
  const notes = item.translation?.notes;

  if (Array.isArray(notes)) {
    return notes.join(" ");
  }

  if (typeof notes === "string") {
    return notes;
  }

  return "";
}

export default function HomePackages({
  packages,
  locale,
  onReserve,
}: HomePackagesProps) {
  if (!packages.length) return null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#483289_0%,#005F74_100%)]">
      <div
        className="absolute inset-x-0 top-0 h-[190px] bg-repeat-x bg-top"
        style={{
          backgroundImage: `url(${patternBg.src})`,
          backgroundSize: "auto 190px",
        }}
      />

      <div className="relative mx-auto max-w-[1380px] px-3 pb-12 pt-6 sm:px-4 md:px-6 lg:px-8 xl:px-10 xl:pb-24 xl:pt-10">
        <h2 className="mb-6 text-center font-[var(--font-be-vietnam-pro)] text-[clamp(1.8rem,4vw,4.7rem)] font-black leading-none text-white md:mb-10">
          {getSectionTitle(locale)}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-8">
          {packages.map((item) => {
            const noteText = getNotesText(item);
            const imageSrc = getCardImage(item);

            return (
              <article
                key={item.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_10px_22px_rgba(0,0,0,0.22)]"
              >
                <div className="relative h-[220px] w-full overflow-hidden sm:h-[240px] md:h-[260px] lg:h-[220px] xl:h-[220px]">
                  <Image
                    src={imageSrc}
                    alt={item.translation?.name || item.code}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <div className="flex flex-1 flex-col px-4 pb-5 pt-4 md:px-5 lg:px-6">
                  <h3 className="font-[var(--font-be-vietnam-pro)] text-[clamp(1.4rem,2vw,2.1rem)] font-black leading-[1.02] text-[#C028B9]">
                    {item.translation?.name || item.code}
                  </h3>

                  <div className="mt-3 min-h-[190px] md:min-h-[210px] lg:min-h-[220px]">
                    <ul className="list-disc space-y-1.5 pl-5 font-[var(--font-be-vietnam-pro)] text-[15px] font-normal leading-[1.35] text-[#111111]">
                      {(item.translation?.includes || []).map((include, index) => (
                        <li
                          key={`${item.id}-include-${index}`}
                          className="break-words"
                        >
                          {include}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="min-h-[48px] pt-4 font-[var(--font-be-vietnam-pro)] text-[13px] font-normal leading-[1.25] text-[#111111]">
                    {noteText}
                  </p>

                  <div className="mt-auto pt-4">
                    <p className="font-[var(--font-be-vietnam-pro)] text-[13px] font-normal leading-[1.2] text-[#111111]">
                      {getAdultLabel(item, locale)}
                    </p>

                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <span className="font-[var(--font-poppins)] text-[clamp(1.8rem,2.5vw,2.6rem)] font-bold leading-none text-[#C028B9]">
                        {formatPrice(item.adultPriceMXN)}
                      </span>
                      <span className="pb-[4px] font-[var(--font-poppins)] text-[1.2rem] font-bold leading-none text-[#C028B9]">
                        {item.currency}
                      </span>
                    </div>

                    {onReserve ? (
                      <button
                        type="button"
                        onClick={() => onReserve(item.code)}
                        className="mt-4 flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[#C028B9] px-4 text-center font-[var(--font-be-vietnam-pro)] text-[14px] font-black uppercase leading-none text-white transition hover:opacity-90"
                      >
                        {getReserveText(locale)}
                      </button>
                    ) : (
                      <Link
                        href={getReserveHref(locale, item.code)}
                        className="mt-4 flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[#C028B9] px-4 text-center font-[var(--font-be-vietnam-pro)] text-[14px] font-black uppercase leading-none text-white transition hover:opacity-90"
                      >
                        {getReserveText(locale)}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
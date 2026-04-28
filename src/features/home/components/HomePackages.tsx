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

const packageOrder: Record<string, number> = {
  KX_BASIC: 1,
  KX_PLUS: 2,
  KX_TOTAL: 3,
};

const includeIconMap = [
  {
    keywords: ["ceremonia", "welcome ceremony"],
    icon: "/packages/svg/Ceremonia.svg",
  },
  {
    keywords: ["chaleco", "life jacket", "lifejacket"],
    icon: "/packages/svg/Chaleco.svg",
  },
  {
    keywords: ["taller", "degust", "chocolate", "tequila", "mezcal", "workshop"],
    icon: "/packages/svg/Vestidor.svg",
  },
  {
    keywords: [
      "baño",
      "bano",
      "regadera",
      "cambiador",
      "instalaciones",
      "bathroom",
      "shower",
      "facilities",
    ],
    icon: "/packages/svg/Vestidor.svg",
  },
  {
    keywords: ["yun chen", "yunchen", "cenote yun"],
    icon: "/packages/svg/Yun Chen.svg",
  },
  {
    keywords: ["x kokay", "xkokay"],
    icon: "/packages/svg/Xkokay.svg",
  },
  {
    keywords: ["buffet", "comida", "meal"],
    icon: "/packages/svg/Buffet.svg",
  },
  {
    keywords: ["bicicleta", "bicicletas", "bicycle", "bike", "transportation"],
    icon: "/packages/svg/Bicicleta.svg",
  },
];

const orderedFeatureKeywords = [
  ["ceremonia", "welcome ceremony"],
  ["chaleco", "life jacket", "lifejacket"],
  ["taller", "degust", "chocolate", "tequila", "mezcal", "workshop"],
  ["instalaciones", "baño", "bano", "regadera", "cambiador", "facilities"],
  ["yun chen", "yunchen", "cenote yun"],
  ["x kokay", "xkokay"],
  ["buffet", "comida", "meal"],
  ["bicicleta", "bicicletas", "bicycle", "bike", "transportation"],
];

function formatPrice(price: number) {
  return `$${(price / 100).toFixed(2)}`;
}

function getSectionTitle(locale: "es" | "en") {
  return locale === "es" ? "Elige tu paquete" : "Choose your package";
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

function normalizeText(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getIncludeIcon(include: string) {
  const text = normalizeText(include);

  const match = includeIconMap.find((item) =>
    item.keywords.some((keyword) => text.includes(normalizeText(keyword)))
  );

  return match?.icon || "/packages/svg/Ceremonia.svg";
}

function getFeatureOrder(include: string) {
  const text = normalizeText(include);

  const index = orderedFeatureKeywords.findIndex((group) =>
    group.some((keyword) => text.includes(normalizeText(keyword)))
  );

  return index === -1 ? 99 : index;
}

function sortIncludes(includes: string[]) {
  return [...includes].sort((a, b) => getFeatureOrder(a) - getFeatureOrder(b));
}

function shouldBeBold(packageCode: string, include: string) {
  const text = normalizeText(include);

  if (packageCode === "KX_PLUS") {
    return (
      text.includes("buffet") ||
      text.includes("comida") ||
      text.includes("meal")
    );
  }

  if (packageCode === "KX_TOTAL") {
    return (
      text.includes("yun chen") ||
      text.includes("yunchen") ||
      text.includes("cenote yun") ||
      text.includes("x kokay") ||
      text.includes("xkokay") ||
      text.includes("buffet") ||
      text.includes("comida") ||
      text.includes("meal") ||
      text.includes("bicicleta") ||
      text.includes("bicicletas") ||
      text.includes("bicycle") ||
      text.includes("bike") ||
      text.includes("transportation")
    );
  }

  return false;
}

export default function HomePackages({
  packages,
  locale,
  onReserve,
}: HomePackagesProps) {
  if (!packages.length) return null;

  const sortedPackages = [...packages].sort((a, b) => {
    return (packageOrder[a.code] || 99) - (packageOrder[b.code] || 99);
  });

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#483289_0%,#005F74_100%)]">
      <div
        className="absolute inset-x-0 top-0 h-[190px] bg-repeat-x bg-top"
        style={{
          backgroundImage: `url(${patternBg.src})`,
          backgroundSize: "auto 190px",
        }}
      />

      <div className="relative mx-auto max-w-[1380px] px-4 pb-12 pt-6 sm:px-5 md:px-6 lg:px-8 xl:px-10 xl:pb-24 xl:pt-10">
        <h2 className="mb-8 text-center font-[var(--font-be-vietnam-pro)] text-[clamp(2.3rem,5vw,4.8rem)] font-black leading-none text-white md:mb-10">
          {getSectionTitle(locale)}
        </h2>

        <div className="grid grid-cols-1 items-stretch gap-7 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {sortedPackages.map((item) => {
            const noteText = getNotesText(item);
            const imageSrc = getCardImage(item);
            const includes = sortIncludes(item.translation?.includes || []);

            return (
              <article
                key={item.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_14px_28px_rgba(0,0,0,0.25)]"
              >
                <div className="relative h-[190px] w-full overflow-hidden sm:h-[205px] lg:h-[190px] xl:h-[200px]">
                  <Image
                    src={imageSrc}
                    alt={item.translation?.name || item.code}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={item.code === "KX_BASIC"}
                  />
                </div>

                <div className="flex min-h-[515px] flex-1 flex-col px-6 pb-5 pt-6 lg:px-6 xl:px-7">
                  <h3 className="whitespace-nowrap font-[var(--font-be-vietnam-pro)] text-[clamp(1.35rem,2vw,1.85rem)] font-black leading-[1] tracking-[-0.02em] text-[#C028B9]">
                    {item.translation?.name || item.code}
                  </h3>

                  <div className="mt-5 min-h-[205px]">
                    <ul className="space-y-[8px] font-[var(--font-be-vietnam-pro)] text-[14px] font-normal leading-[19px] text-[#111111] xl:text-[14.5px]">
                      {includes.map((include, index) => {
                        const icon = getIncludeIcon(include);
                        const bold = shouldBeBold(item.code, include);

                        return (
                          <li
                            key={`${item.id}-include-${index}`}
                            className="grid grid-cols-[17px_1fr] items-start gap-[9px]"
                          >
                            <span className="relative mt-[2px] block h-[15px] w-[15px] shrink-0">
                              <Image
                                src={icon}
                                alt=""
                                fill
                                className="object-contain"
                                sizes="15px"
                              />
                            </span>

                            <span
                              className={`break-words ${
                                bold
                                  ? "font-black text-[#050505]"
                                  : "font-normal text-[#111111]"
                              }`}
                            >
                              {include}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="mt-auto pt-8">
                    <p className="mb-2 font-[var(--font-be-vietnam-pro)] text-[13px] font-normal leading-[17px] text-[#111111]">
                      {noteText}
                    </p>

                    <p className="font-[var(--font-be-vietnam-pro)] text-[14px] font-normal leading-[19px] text-[#111111]">
                      {getAdultLabel(item, locale)}
                    </p>

                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <span className="font-[var(--font-poppins)] text-[clamp(2.55rem,4vw,3.45rem)] font-bold leading-none text-[#C028B9]">
                        {formatPrice(item.adultPriceMXN)}
                      </span>

                      <span className="pb-[7px] font-[var(--font-poppins)] text-[14px] font-bold leading-none text-[#C028B9]">
                        {item.currency}
                      </span>
                    </div>

                    {onReserve ? (
                      <button
                        type="button"
                        onClick={() => onReserve(item.code)}
                        className="mt-4 flex h-[44px] w-full items-center justify-center rounded-[7px] bg-[#C028B9] px-4 text-center font-[var(--font-be-vietnam-pro)] text-[14px] font-black uppercase leading-none text-white transition hover:bg-[#a91fa3]"
                      >
                        {getReserveText(locale)}
                      </button>
                    ) : (
                      <Link
                        href={getReserveHref(locale, item.code)}
                        className="mt-4 flex h-[44px] w-full items-center justify-center rounded-[7px] bg-[#C028B9] px-4 text-center font-[var(--font-be-vietnam-pro)] text-[14px] font-black uppercase leading-none text-white transition hover:bg-[#a91fa3]"
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
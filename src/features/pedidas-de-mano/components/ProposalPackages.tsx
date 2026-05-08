"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ProposalPackagesProps {
  locale: "es" | "en";
}

type ProposalPackageItem = {
  id: string;
  title: string;
  packageName: string;
  includes: string[];
  excludes: string[];
  buttonText: string;
  buttonHref: string;
};

const phoneNumber = "529987510867";

const createWhatsappLink = ({
  locale,
  packageName,
}: {
  locale: "es" | "en";
  packageName: string;
}) => {
  const message =
    locale === "es"
      ? `Hola, me gustaría cotizar el paquete ${packageName} para una pedida de mano.`
      : `Hello, I would like to quote the ${packageName} package for a marriage proposal.`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};

const packageMeanings: Record<
  string,
  {
    es: string;
    en: string;
  }
> = {
  yaakun: {
    es: "Amor",
    en: "Love",
  },
  kuxtal: {
    es: "Vida",
    en: "Life",
  },
  tuukul: {
    es: "Pensamiento",
    en: "Thought",
  },
  kaanal: {
    es: "Cielo",
    en: "Sky",
  },
};

function normalizePackageName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/’/g, "")
    .replace(/'/g, "")
    .replace(/´/g, "")
    .replace(/`/g, "");
}

function getPackageMeaning(packageName: string, locale: "es" | "en") {
  const key = normalizePackageName(packageName);

  return packageMeanings[key]?.[locale] || packageName;
}

function AnimatedPackageName({
  packageName,
  locale,
  active,
}: {
  packageName: string;
  locale: "es" | "en";
  active: boolean;
}) {
  const meaning = getPackageMeaning(packageName, locale);
  const hasMeaning = meaning !== packageName;

  return (
    <span
      className="
        relative block h-[42px] overflow-hidden
        text-[clamp(1.75rem,3.4vw,2.25rem)]
        font-bold leading-[1.02]
        lg:h-[34px] lg:text-[1.55rem]
        xl:h-[42px] xl:text-[1.9rem]
        2xl:h-[46px] 2xl:text-[2.1rem]
      "
      title={hasMeaning ? `${packageName} = ${meaning}` : packageName}
    >
      <span
        className={[
          "absolute left-0 top-0 block",
          "transition-all duration-500 ease-out",

          active
            ? "-translate-y-full opacity-0"
            : "translate-y-0 opacity-100",

          hasMeaning
            ? "md:group-hover:-translate-y-full md:group-hover:opacity-0"
            : "",
        ].join(" ")}
      >
        {packageName}
      </span>

      {hasMeaning && (
        <span
          className={[
            "absolute left-0 top-0 block",
            "transition-all duration-500 ease-out",

            active
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0",

            "md:group-hover:translate-y-0 md:group-hover:opacity-100",
          ].join(" ")}
        >
          {meaning}
        </span>
      )}
    </span>
  );
}

const packagesContent: Record<"es" | "en", ProposalPackageItem[]> = {
  es: [
    {
      id: "yaakun",
      title: "Paquete\nYaakun",
      packageName: "Yaakun",
      includes: [
        "Pedida de mano dentro del cenote Yun-chen (solo pareja)",
        "Bendición tradicional maya",
        "Eco-parque:",
        "Taller de chocolate",
        "Taller de mezcal y tequila",
        "Taller de obsidiana",
        "Áreas comunes",
      ],
      excludes: [
        "Fotografías",
        "Decoración adicional",
        "Tiempo libre en el parque",
        "Entrada al parque para 2 adultos",
        "Buffet",
        "Transportación",
      ],
      buttonText: "Cotizar",
      buttonHref: "",
    },
    {
      id: "kuxtal",
      title: "Paquete\nKuxtal",
      packageName: "Kuxtal",
      includes: [
        "Pedida de mano dentro del cenote a elegir",
        "Bendición tradicional maya",
        "Eco-parque:",
        "Taller de chocolate",
        "Taller de mezcal y tequila",
        "Taller de obsidiana",
        "Áreas comunes",
        "Entrada al parque para 2",
        "Tiempo libre en el parque",
        "Buffet y bebidas naturales",
      ],
      excludes: ["Fotografías", "Decoración adicional", "Transportación"],
      buttonText: "Cotizar",
      buttonHref: "",
    },
    {
      id: "tuukul",
      title: "Paquete\nTuukul",
      packageName: "Tuukul",
      includes: [
        "Pedida de mano dentro del cenote a elegir",
        "Bendición tradicional maya",
        "Eco-parque:",
        "Taller de chocolate",
        "Taller de mezcal y tequila",
        "Taller de obsidiana",
        "Áreas comunes",
        "Entrada al parque para 2",
        "Tiempo libre en el parque",
        "Buffet y bebidas naturales",
        "Ramo de flores (rosas blancas)",
        "2 bebidas de cortesía para brindis (mezcalita)",
      ],
      excludes: ["Fotografías", "Decoración adicional", "Transportación"],
      buttonText: "Cotizar",
      buttonHref: "",
    },
    {
      id: "kaanal",
      title: "Paquete\nKa’anal",
      packageName: "Ka’anal",
      includes: [
        "Pedida de mano dentro del cenote a elegir",
        "Bendición tradicional maya",
        "Eco-parque:",
        "Taller de chocolate",
        "Taller de mezcal y tequila",
        "Taller de obsidiana",
        "Áreas comunes",
        "Entrada al parque para 2",
        "Tiempo libre en el parque",
        "Buffet y bebidas naturales",
        "Ramo de flores (rosas blancas)",
        "2 bebidas de cortesía para brindis (mezcalita)",
        "Fotografía (1 video y 40-60 fotografías)",
        "Decoración adicional",
      ],
      excludes: ["Transportación"],
      buttonText: "Cotizar",
      buttonHref: "",
    },
  ],
  en: [
    {
      id: "yaakun",
      title: "Package\nYaakun",
      packageName: "Yaakun",
      includes: [
        "Proposal inside Yun-chen cenote (couple only)",
        "Traditional Mayan blessing",
        "Eco-park:",
        "Chocolate workshop",
        "Mezcal and tequila workshop",
        "Obsidian workshop",
        "Common areas",
      ],
      excludes: [
        "Photography",
        "Additional decoration",
        "Free time in the park",
        "Park admission for 2 adults",
        "Buffet",
        "Transportation",
      ],
      buttonText: "Quote",
      buttonHref: "",
    },
    {
      id: "kuxtal",
      title: "Package\nKuxtal",
      packageName: "Kuxtal",
      includes: [
        "Proposal inside the selected cenote",
        "Traditional Mayan blessing",
        "Eco-park:",
        "Chocolate workshop",
        "Mezcal and tequila workshop",
        "Obsidian workshop",
        "Common areas",
        "Park admission for 2",
        "Free time in the park",
        "Buffet and natural beverages",
      ],
      excludes: ["Photography", "Additional decoration", "Transportation"],
      buttonText: "Quote",
      buttonHref: "",
    },
    {
      id: "tuukul",
      title: "Package\nTuukul",
      packageName: "Tuukul",
      includes: [
        "Proposal inside the selected cenote",
        "Traditional Mayan blessing",
        "Eco-park:",
        "Chocolate workshop",
        "Mezcal and tequila workshop",
        "Obsidian workshop",
        "Common areas",
        "Park admission for 2",
        "Free time in the park",
        "Buffet and natural beverages",
        "Bouquet of flowers (white roses)",
        "2 courtesy drinks for toast (mezcalita)",
      ],
      excludes: ["Photography", "Additional decoration", "Transportation"],
      buttonText: "Quote",
      buttonHref: "",
    },
    {
      id: "kaanal",
      title: "Package\nKa’anal",
      packageName: "Ka’anal",
      includes: [
        "Proposal inside the selected cenote",
        "Traditional Mayan blessing",
        "Eco-park:",
        "Chocolate workshop",
        "Mezcal and tequila workshop",
        "Obsidian workshop",
        "Common areas",
        "Park admission for 2",
        "Free time in the park",
        "Buffet and natural beverages",
        "Bouquet of flowers (white roses)",
        "2 courtesy drinks for toast (mezcalita)",
        "Photography (1 video and 40-60 photos)",
        "Additional decoration",
      ],
      excludes: ["Transportation"],
      buttonText: "Quote",
      buttonHref: "",
    },
  ],
};

const boldItems = [
  "Entrada al parque para 2",
  "Tiempo libre en el parque",
  "Buffet y bebidas naturales",
  "Ramo de flores (rosas blancas)",
  "2 bebidas de cortesía para brindis (mezcalita)",
  "Fotografía (1 video y 40-60 fotografías)",
  "Decoración adicional",
  "Park admission for 2",
  "Free time in the park",
  "Buffet and natural beverages",
  "Bouquet of flowers (white roses)",
  "2 courtesy drinks for toast (mezcalita)",
  "Photography (1 video and 40-60 photos)",
  "Additional decoration",
];

export default function ProposalPackages({ locale }: ProposalPackagesProps) {
  const items = packagesContent[locale];
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeMobileCardId, setActiveMobileCardId] = useState<string | null>(
    null
  );

  const sectionTitle =
    locale === "es" ? "Conoce nuestros paquetes" : "Discover our packages";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileQuery = window.matchMedia("(max-width: 767px)");

    function clearActiveIfDesktop() {
      if (!mobileQuery.matches) {
        setActiveMobileCardId(null);
      }
    }

    clearActiveIfDesktop();

    const observer = new IntersectionObserver(
      (entries) => {
        if (!mobileQuery.matches) return;

        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const mostVisibleEntry = visibleEntries[0];

        if (!mostVisibleEntry) return;

        const packageId = mostVisibleEntry.target.getAttribute(
          "data-package-id"
        );

        if (packageId) {
          setActiveMobileCardId(packageId);
        }
      },
      {
        threshold: [0.35, 0.45, 0.55, 0.65, 0.75],
        rootMargin: "-18% 0px -18% 0px",
      }
    );

    Object.values(cardRefs.current).forEach((card) => {
      if (card) observer.observe(card);
    });

    mobileQuery.addEventListener("change", clearActiveIfDesktop);

    return () => {
      observer.disconnect();
      mobileQuery.removeEventListener("change", clearActiveIfDesktop);
    };
  }, [items]);

  return (
    <section className="w-full bg-[#005F73] pb-16 pt-8 md:pb-20 md:pt-10 xl:pb-24">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 md:px-9 lg:px-8 xl:px-12">
        <div className="mb-8 flex items-center justify-center gap-4 md:mb-12 md:gap-7">
          <div className="h-px flex-1 bg-white/80" />

          <h2
            className="text-center text-[clamp(1.8rem,3.2vw,2.65rem)] font-black leading-[1.1] text-white"
            style={{
              fontFamily:
                '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            {sectionTitle}
          </h2>

          <div className="h-px flex-1 bg-white/80" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-4 xl:gap-6">
          {items.map((item) => {
            const whatsappHref = createWhatsappLink({
              locale,
              packageName: item.packageName,
            });

            const packageLabel = item.title.split("\n")[0];
            const isMobileActive = activeMobileCardId === item.id;

            return (
              <article
                key={item.id}
                data-package-id={item.id}
                ref={(node) => {
                  cardRefs.current[item.id] = node;
                }}
                className={[
                  "group relative flex min-h-[610px] flex-col",
                  "rounded-[22px]",
                  "px-5 pb-5 pt-6",
                  "shadow-[0px_34px_30px_0px_rgba(72,50,137,0.34)]",
                  "transition-all duration-300 ease-out",
                  "sm:px-6",
                  "lg:min-h-[590px] lg:rounded-[18px] lg:px-4 lg:pb-4 lg:pt-5",
                  "xl:min-h-[620px] xl:rounded-[22px] xl:px-5 xl:pb-5 xl:pt-6",

                  isMobileActive
                    ? "-translate-y-2 bg-white text-[#C028B9]"
                    : "bg-[#C028B9] text-white",

                  "md:hover:-translate-y-2 md:hover:bg-white md:hover:text-[#C028B9]",
                ].join(" ")}
              >
                <h3
                  className={[
                    "min-h-[62px] max-w-full",
                    "transition-colors duration-300",
                    "lg:min-h-[54px] xl:min-h-[64px]",
                    isMobileActive ? "text-[#C028B9]" : "text-white",
                    "md:group-hover:text-[#C028B9]",
                  ].join(" ")}
                  style={{
                    fontFamily:
                      '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                  }}
                >
                  <span
                    className="
                      block
                      text-[clamp(1.35rem,2.8vw,1.9rem)]
                      font-bold leading-[1.02]
                      lg:text-[1.2rem]
                      xl:text-[1.55rem]
                      2xl:text-[1.7rem]
                    "
                  >
                    {packageLabel}
                  </span>

                  <AnimatedPackageName
                    packageName={item.packageName}
                    locale={locale}
                    active={isMobileActive}
                  />
                </h3>

                <div
                  className={[
                    "mt-3 h-px w-full transition-colors duration-300",
                    isMobileActive ? "bg-[#C028B9]/45" : "bg-white/60",
                    "md:group-hover:bg-[#C028B9]/45",
                  ].join(" ")}
                />

                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={[
                        "flex h-[22px] w-[22px] shrink-0 items-center justify-center",
                        "rounded-full transition-colors duration-300",
                        isMobileActive
                          ? "bg-[#F8DDF5] text-[#C028B9]"
                          : "bg-white/20 text-white",
                        "md:group-hover:bg-[#F8DDF5] md:group-hover:text-[#C028B9]",
                      ].join(" ")}
                    >
                      <Check size={16} strokeWidth={4} />
                    </span>

                    <p
                      className={[
                        "text-[17px] font-normal transition-colors duration-300",
                        "lg:text-[14px] xl:text-[16px]",
                        isMobileActive ? "text-[#C028B9]" : "text-white",
                        "md:group-hover:text-[#C028B9]",
                      ].join(" ")}
                      style={{
                        fontFamily:
                          '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                      }}
                    >
                      {locale === "es" ? "Inclusiones" : "Includes"}
                    </p>
                  </div>

                  <ul
                    className={[
                      "list-disc space-y-[2px] pl-5",
                      "text-[14.5px] font-normal leading-[1.18]",
                      "marker:text-current transition-colors duration-300",
                      "lg:space-y-[1px] lg:pl-4 lg:text-[11.8px] lg:leading-[1.15]",
                      "xl:space-y-[2px] xl:pl-5 xl:text-[13px] xl:leading-[1.18]",
                      "2xl:text-[14px]",
                      isMobileActive ? "text-[#C028B9]" : "text-white",
                      "md:group-hover:text-[#C028B9]",
                    ].join(" ")}
                    style={{
                      fontFamily:
                        '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                    }}
                  >
                    {item.includes.map((include, index) => (
                      <li
                        key={`${item.id}-include-${index}`}
                        className={
                          boldItems.includes(include) ? "font-black" : ""
                        }
                      >
                        {include}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-5 lg:pt-4 xl:pt-6">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={[
                        "flex h-[22px] w-[22px] shrink-0 items-center justify-center",
                        "rounded-full transition-colors duration-300",
                        isMobileActive
                          ? "bg-[#F8DDF5] text-[#C028B9]"
                          : "bg-white/20 text-white",
                        "md:group-hover:bg-[#F8DDF5] md:group-hover:text-[#C028B9]",
                      ].join(" ")}
                    >
                      <X size={16} strokeWidth={4} />
                    </span>

                    <p
                      className={[
                        "text-[17px] font-normal transition-colors duration-300",
                        "lg:text-[14px] xl:text-[16px]",
                        isMobileActive ? "text-[#C028B9]" : "text-white",
                        "md:group-hover:text-[#C028B9]",
                      ].join(" ")}
                      style={{
                        fontFamily:
                          '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                      }}
                    >
                      {locale === "es" ? "Exclusiones" : "Excludes"}
                    </p>
                  </div>

                  <ul
                    className={[
                      "list-disc space-y-[2px] pl-5",
                      "text-[14.5px] font-normal leading-[1.18]",
                      "marker:text-current transition-colors duration-300",
                      "lg:space-y-[1px] lg:pl-4 lg:text-[11.8px] lg:leading-[1.15]",
                      "xl:space-y-[2px] xl:pl-5 xl:text-[13px] xl:leading-[1.18]",
                      "2xl:text-[14px]",
                      isMobileActive ? "text-[#C028B9]" : "text-white",
                      "md:group-hover:text-[#C028B9]",
                    ].join(" ")}
                    style={{
                      fontFamily:
                        '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                    }}
                  >
                    {item.excludes.map((exclude, index) => (
                      <li key={`${item.id}-exclude-${index}`}>{exclude}</li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    "mt-6 inline-flex h-[44px] w-full",
                    "items-center justify-center",
                    "rounded-[11px]",
                    "text-center text-[18px] font-bold",
                    "transition-all duration-300",
                    "lg:mt-5 lg:h-[40px] lg:rounded-[9px] lg:text-[15px]",
                    "xl:h-[44px] xl:text-[17px]",
                    "2xl:h-[46px] 2xl:text-[18px]",
                    isMobileActive
                      ? "bg-[#483289] text-white"
                      : "bg-white text-[#C028B9]",
                    "md:group-hover:bg-[#483289] md:group-hover:text-white",
                  ].join(" ")}
                  style={{
                    fontFamily:
                      '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                  }}
                >
                  {item.buttonText}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
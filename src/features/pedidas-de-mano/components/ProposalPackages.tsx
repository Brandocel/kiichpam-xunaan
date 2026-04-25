"use client";

import Link from "next/link";

interface ProposalPackagesProps {
  locale: "es" | "en";
}

type ProposalPackageItem = {
  id: string;
  title: string;
  includes: string[];
  excludes: string[];
  buttonText: string;
  buttonHref: string;
};

const packagesContent: Record<"es" | "en", ProposalPackageItem[]> = {
  es: [
    {
      id: "amor-de-verano",
      title: "Amor de Verano",
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
      buttonHref: "/es/contacto",
    },
    {
      id: "tesoro-de-amor",
      title: "Tesoro de Amor",
      includes: [
        "Entrada al parque para 2",
        "Pedida de mano dentro del cenote a elegir",
        "Bendición tradicional del maya",
        "Tiempo libre en el parque",
        "Buffet y bebidas naturales",
        "Eco-parque:",
        "Taller de chocolate",
        "Taller de mezcal y tequila",
        "Taller de obsidiana",
        "Áreas comunes",
      ],
      excludes: ["Fotografías", "Decoración adicional", "Transportación."],
      buttonText: "Cotizar",
      buttonHref: "/es/contacto",
    },
    {
      id: "fragancia-de-amor",
      title: "Fragancia de Amor",
      includes: [
        "Entrada al parque para 2",
        "Pedida de mano dentro del cenote a elegir",
        "Bendición tradicional del maya",
        "Ramo de flores (rosas blancas)",
        "Tiempo libre en el parque.",
        "Buffet y bebidas naturales",
        "2 bebidas de cortesía para brindis (mezcalita)",
        "Eco-parque:",
        "Taller de chocolate",
        "Taller de mezcal y tequila",
        "Taller de obsidiana",
        "Áreas comunes",
      ],
      excludes: ["Fotografías", "Decoración adicional", "Transportación."],
      buttonText: "Cotizar",
      buttonHref: "/es/contacto",
    },
    {
      id: "amor-eterno",
      title: "Amor Eterno",
      includes: [
        "Entrada al parque para 2",
        "Pedida de mano dentro del cenote a elegir",
        "Bendición tradicional del maya",
        "Ramo de flores (rosas blancas)",
        "Tiempo libre en el parque.",
        "Buffet y bebidas naturales",
        "2 bebidas de cortesía para brindis (mezcalita)",
        "Fotografía (1 video y 40-60 fotografías)",
        "Decoración adicional",
        "Eco-parque:",
        "Taller de chocolate",
        "Taller de mezcal y tequila",
        "Taller de obsidiana",
        "Áreas comunes",
      ],
      excludes: ["Transportación."],
      buttonText: "Cotizar",
      buttonHref: "/es/contacto",
    },
  ],
  en: [
    {
      id: "summer-love",
      title: "Summer Love",
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
      buttonHref: "/en/contacto",
    },
    {
      id: "treasure-of-love",
      title: "Treasure of Love",
      includes: [
        "Park admission for 2",
        "Proposal inside the selected cenote",
        "Traditional Mayan blessing",
        "Free time in the park",
        "Buffet and natural beverages",
        "Eco-park:",
        "Chocolate workshop",
        "Mezcal and tequila workshop",
        "Obsidian workshop",
        "Common areas",
      ],
      excludes: ["Photography", "Additional decoration", "Transportation."],
      buttonText: "Quote",
      buttonHref: "/en/contacto",
    },
    {
      id: "fragrance-of-love",
      title: "Fragrance of Love",
      includes: [
        "Park admission for 2",
        "Proposal inside the selected cenote",
        "Traditional Mayan blessing",
        "Bouquet of flowers (white roses)",
        "Free time in the park.",
        "Buffet and natural beverages",
        "2 courtesy drinks for toast (mezcalita)",
        "Eco-park:",
        "Chocolate workshop",
        "Mezcal and tequila workshop",
        "Obsidian workshop",
        "Common areas",
      ],
      excludes: ["Photography", "Additional decoration", "Transportation."],
      buttonText: "Quote",
      buttonHref: "/en/contacto",
    },
    {
      id: "eternal-love",
      title: "Eternal Love",
      includes: [
        "Park admission for 2",
        "Proposal inside the selected cenote",
        "Traditional Mayan blessing",
        "Bouquet of flowers (white roses)",
        "Free time in the park.",
        "Buffet and natural beverages",
        "2 courtesy drinks for toast (mezcalita)",
        "Photography (1 video and 40-60 photos)",
        "Additional decoration",
        "Eco-park:",
        "Chocolate workshop",
        "Mezcal and tequila workshop",
        "Obsidian workshop",
        "Common areas",
      ],
      excludes: ["Transportation."],
      buttonText: "Quote",
      buttonHref: "/en/contacto",
    },
  ],
};

export default function ProposalPackages({ locale }: ProposalPackagesProps) {
  const items = packagesContent[locale];

  const sectionTitle =
    locale === "es" ? "Conoce nuestros paquetes" : "Discover our packages";

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
          {items.map((item) => (
            <article
              key={item.id}
              className="
                group relative flex min-h-[610px] flex-col
                rounded-[22px] bg-[#C028B9]
                px-5 pb-5 pt-6
                text-white
                shadow-[0px_34px_30px_0px_rgba(72,50,137,0.34)]
                transition-all duration-300 ease-out
                hover:-translate-y-2 hover:bg-white hover:text-[#C028B9]
                sm:px-6
                lg:min-h-[590px] lg:rounded-[18px] lg:px-4 lg:pb-4 lg:pt-5
                xl:min-h-[620px] xl:rounded-[22px] xl:px-5 xl:pb-5 xl:pt-6
              "
            >
              <h3
                className="
                  min-h-[62px]
                  max-w-full
                  text-[clamp(1.75rem,3.4vw,2.25rem)]
                  font-bold leading-[1.02]
                  text-white transition-colors duration-300
                  group-hover:text-[#C028B9]
                  lg:min-h-[54px] lg:text-[1.55rem] lg:leading-[1.05]
                  xl:min-h-[64px] xl:text-[1.9rem]
                  2xl:text-[2.1rem]
                "
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                {item.title}
              </h3>

              <div className="mt-3 h-px w-full bg-white/60 transition-colors duration-300 group-hover:bg-[#C028B9]/45" />

              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[16px] text-white/90 transition-colors duration-300 group-hover:text-[#F2C8ED]">
                    ✓
                  </span>

                  <p
                    className="text-[17px] font-normal text-white transition-colors duration-300 group-hover:text-[#C028B9] lg:text-[14px] xl:text-[16px]"
                    style={{
                      fontFamily:
                        '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                    }}
                  >
                    {locale === "es" ? "Inclusiones" : "Includes"}
                  </p>
                </div>

                <ul
                  className="
                    list-disc space-y-[2px] pl-5
                    text-[14.5px] font-normal leading-[1.18]
                    text-white marker:text-current
                    transition-colors duration-300
                    group-hover:text-[#C028B9]
                    lg:space-y-[1px] lg:pl-4 lg:text-[11.8px] lg:leading-[1.15]
                    xl:space-y-[2px] xl:pl-5 xl:text-[13px] xl:leading-[1.18]
                    2xl:text-[14px]
                  "
                  style={{
                    fontFamily:
                      '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                  }}
                >
                  {item.includes.map((include, index) => (
                    <li key={`${item.id}-include-${index}`}>{include}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-5 lg:pt-4 xl:pt-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[16px] text-white/90 transition-colors duration-300 group-hover:text-[#F09AE3]">
                    ✕
                  </span>

                  <p
                    className="text-[17px] font-normal text-white transition-colors duration-300 group-hover:text-[#C028B9] lg:text-[14px] xl:text-[16px]"
                    style={{
                      fontFamily:
                        '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                    }}
                  >
                    {locale === "es" ? "Exclusiones" : "Excludes"}
                  </p>
                </div>

                <ul
                  className="
                    list-disc space-y-[2px] pl-5
                    text-[14.5px] font-normal leading-[1.18]
                    text-white marker:text-current
                    transition-colors duration-300
                    group-hover:text-[#C028B9]
                    lg:space-y-[1px] lg:pl-4 lg:text-[11.8px] lg:leading-[1.15]
                    xl:space-y-[2px] xl:pl-5 xl:text-[13px] xl:leading-[1.18]
                    2xl:text-[14px]
                  "
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
                href={item.buttonHref}
                className="
                  mt-6 inline-flex h-[44px] w-full
                  items-center justify-center
                  rounded-[11px]
                  bg-white
                  text-center text-[18px] font-bold text-[#C028B9]
                  transition-all duration-300
                  group-hover:bg-[#483289] group-hover:text-white
                  lg:mt-5 lg:h-[40px] lg:rounded-[9px] lg:text-[15px]
                  xl:h-[44px] xl:text-[17px]
                  2xl:h-[46px] 2xl:text-[18px]
                "
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                {item.buttonText}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
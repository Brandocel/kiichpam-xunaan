"use client";

import Link from "next/link";

interface ProposalPackagesProps {
  locale: "es" | "en";
}

type PackageCard = {
  id: string;
  title: string;
  includes: string[];
  excludes: string[];
  buttonText: string;
  buttonHref: string;
};

const packagesContent: Record<"es" | "en", PackageCard[]> = {
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
        "Proposal inside selected cenote",
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
        "Proposal inside selected cenote",
        "Traditional Mayan blessing",
        "Bouquet of flowers (white roses)",
        "Free time in the park",
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
        "Proposal inside selected cenote",
        "Traditional Mayan blessing",
        "Bouquet of flowers (white roses)",
        "Free time in the park",
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

export default function ProposalPackages({
  locale,
}: ProposalPackagesProps) {
  const items = packagesContent[locale];
  const sectionTitle =
    locale === "es" ? "Conoce nuestros paquetes" : "Discover our packages";

  return (
    <section className="w-full bg-[#005F73] pb-20 pt-8 md:pb-24 md:pt-10">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16">
        <div className="mb-10 flex items-center justify-center gap-5 md:mb-14 md:gap-8">
          <div className="h-px flex-1 bg-white/80" />
          <h2
            className="text-center text-[30px] font-black leading-[1.15] text-white md:text-[42px]"
            style={{
              fontFamily:
                '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            {sectionTitle}
          </h2>
          <div className="h-px flex-1 bg-white/80" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {items.map((item) => (
            <article
              key={item.id}
              className="
                group relative flex min-h-[632px] flex-col
                rounded-[26px] bg-[#C028B9]
                px-7 pb-6 pt-7
                text-white
                shadow-[0px_42px_34px_0px_rgba(72,50,137,0.38)]
                transition-all duration-300 ease-out
                hover:-translate-y-3 hover:bg-white hover:text-[#C028B9]
              "
            >
              <h3
                className="
                  max-w-[240px]
                  text-[36px] font-bold leading-[38px]
                  text-white transition-colors duration-300
                  group-hover:text-[#C028B9]
                "
                style={{
                  fontFamily:
                    '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                {item.title}
              </h3>

              <div className="mt-3 h-px w-full bg-white/60 transition-colors duration-300 group-hover:bg-[#C028B9]/45" />

              <div className="mt-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[18px] text-white/90 transition-colors duration-300 group-hover:text-[#F2C8ED]">
                    ✓
                  </span>

                  <p
                    className="text-[20px] font-normal text-white transition-colors duration-300 group-hover:text-[#C028B9]"
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
                    text-[16px] font-normal leading-[1.2]
                    text-white marker:text-current
                    transition-colors duration-300
                    group-hover:text-[#C028B9]
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

              <div className="mt-auto pt-10">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[18px] text-white/90 transition-colors duration-300 group-hover:text-[#F09AE3]">
                    ✕
                  </span>

                  <p
                    className="text-[20px] font-normal text-white transition-colors duration-300 group-hover:text-[#C028B9]"
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
                    text-[16px] font-normal leading-[1.2]
                    text-white marker:text-current
                    transition-colors duration-300
                    group-hover:text-[#C028B9]
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
                  mt-8 inline-flex h-[49px] w-full
                  items-center justify-center
                  rounded-[12px]
                  bg-white
                  text-center text-[20px] font-bold text-[#C028B9]
                  transition-all duration-300
                  group-hover:bg-[#483289] group-hover:text-white
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
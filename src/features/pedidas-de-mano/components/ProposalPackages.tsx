"use client";

import Link from "next/link";
import type { ProposalPackageItem } from "../types/proposal.types";

interface ProposalPackagesProps {
  items: ProposalPackageItem[];     // ← Agregado
  locale: "es" | "en";
}

export default function ProposalPackages({
  items,
  locale,
}: ProposalPackagesProps) {
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
              fontFamily: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            {sectionTitle}
          </h2>
          <div className="h-px flex-1 bg-white/80" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {items.map((item, index) => (
            <article
              key={index}
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
                  fontFamily: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
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
                      fontFamily: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
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
                    fontFamily: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                  }}
                >
                  {item.includes?.map((include, i) => (
                    <li key={i}>{include}</li>
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
                      fontFamily: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
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
                    fontFamily: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                  }}
                >
                  {item.excludes?.map((exclude, i) => (
                    <li key={i}>{exclude}</li>
                  ))}
                </ul>
              </div>

              <Link
                href={item.buttonHref || "#"}
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
                  fontFamily: '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
                }}
              >
                {item.buttonText || "Cotizar"}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
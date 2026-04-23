import Image from "next/image";
import Link from "next/link";

interface HomeAboutProps {
  locale?: "es" | "en";
}

const content = {
  es: {
    eyebrow: "Cenotes en Quintana Roo y Yucatán",
    title: "Kiichpam Xunáan",
    description:
      "¡Descubre la maravilla de los cenotes en Yucatán y Valladolid en el parque natural Ki’ichpam Xunáan! Sumérgete en un paraíso subterráneo único en nuestro parque temático. Explora pozos de agua cristalina, cavernas misteriosas y la rica cultura maya.",
    button: "Ver mapa",
  },
  en: {
    eyebrow: "Cenotes en Quintana Roo y Yucatán",
    title: "Kiichpam Xunáan",
    description:
      "Discover the wonder of the cenotes in Yucatán and Valladolid at the natural park Ki’ichpam Xunáan! Immerse yourself in a unique underground paradise in our theme park. Explore crystal-clear water pools, mysterious caverns, and the rich Mayan culture.",
    button: "View map",
  },
} as const;

export default function HomeAbout({ locale = "es" }: HomeAboutProps) {
  const t = content[locale];

  return (
    <section className="relative overflow-hidden bg-[#005F74]">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "url('/cenote/textura.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "1500px auto",
          backgroundPosition: "center",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-[76px] bg-repeat-x bg-bottom sm:h-[88px] md:h-[96px] lg:h-[104px] xl:h-[112px]"
        style={{
          backgroundSize: "auto 100%",
        }}
      />

      <div className="relative mx-auto max-w-[1360px] px-4 pb-[76px] pt-4 sm:px-5 sm:pb-[82px] sm:pt-5 md:px-6 md:pb-[88px] md:pt-6 lg:px-8 lg:pb-[94px] lg:pt-6 xl:px-10 xl:pb-[102px] xl:pt-7">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-10 xl:gap-12">
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[561px]">
            <div className="relative aspect-[561/378] overflow-hidden rounded-[14px] shadow-[0_18px_40px_rgba(0,0,0,0.26)]">
              <Image
                src="/cenote/CenoteAbout.webp"
                alt="Cenote Kiichpam Xunáan"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 320px, (max-width: 768px) 400px, (max-width: 1024px) 480px, 561px"
              />
            </div>
          </div>

          <div className="w-full max-w-[320px] text-left sm:max-w-[420px] md:max-w-[500px] lg:max-w-[537px]">
            <h2
              className="text-white leading-[0.92] tracking-[-0.02em] text-[clamp(2.5rem,5vw,5.4rem)]"
              style={{
                fontFamily: '"Starting Lineup", "Times New Roman", serif',
                fontWeight: 400,
              }}
            >
              {t.title}
            </h2>

            <p className="mt-2 font-[var(--font-be-vietnam-pro)] text-[11px] font-medium leading-[1.2] text-white sm:text-[12px] md:text-[13px]">
              {t.eyebrow}
            </p>

            <p className="mt-4 font-[var(--font-be-vietnam-pro)] text-[clamp(1rem,1.35vw,1.18rem)] font-normal leading-[1.35] text-white">
              {t.description}
            </p>

            <Link
              href={`/${locale}/mapa`}
              className="mt-5 inline-flex h-[40px] min-w-[128px] items-center justify-center rounded-[8px] bg-[#C028B9] px-5 font-[var(--font-be-vietnam-pro)] text-[13px] font-extrabold text-white transition hover:opacity-90 sm:h-[42px] sm:min-w-[132px] sm:text-[14px] md:h-[44px] md:min-w-[136px]"
            >
              {t.button}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
import Image from "next/image";
import Link from "next/link";
import patternBg from "../../../assets/Linemorada.webp";

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
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage: "url('/cenote/textura.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "1900px auto",
          backgroundPosition: "center",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-[110px] bg-repeat-x bg-bottom sm:h-[130px] md:h-[150px] lg:h-[170px] xl:h-[190px]"
        style={{
          backgroundImage: `url(${patternBg.src})`,
          backgroundSize: "auto 100%",
        }}
      />

      <div className="relative mx-auto max-w-[1500px] px-4 pb-[95px] pt-10 sm:px-5 sm:pb-[105px] sm:pt-12 md:px-6 md:pb-[120px] md:pt-14 lg:px-8 lg:pb-[135px] lg:pt-20 xl:px-10 xl:pb-[150px] xl:pt-24">
        <div className="flex flex-col items-center justify-end gap-4 sm:gap-5 md:gap-6 lg:min-h-[620px] lg:flex-row lg:items-end lg:justify-center lg:gap-2 xl:min-h-[700px] xl:gap-4">
          <div className="relative z-20 order-2 mx-auto h-[250px] w-[280px] shrink-0 sm:h-[320px] sm:w-[360px] md:h-[390px] md:w-[430px] lg:order-1 lg:mx-0 lg:h-[480px] lg:w-[560px] xl:h-[620px] xl:w-[700px]">
            <Image
              src="/cenote/CenoteYunChen.webp"
              alt="Cenote Yun Chen"
              fill
              priority={false}
              className="object-contain object-center lg:object-left-bottom"
              sizes="(max-width: 640px) 280px, (max-width: 768px) 360px, (max-width: 1024px) 430px, (max-width: 1280px) 560px, 700px"
            />
          </div>

          <div className="relative z-10 order-1 flex w-full max-w-[320px] flex-col items-start self-center sm:max-w-[420px] md:max-w-[520px] lg:order-2 lg:max-w-[500px] lg:self-end lg:pb-[110px] xl:max-w-[560px] xl:pb-[135px]">
            <h2
              className="leading-none tracking-[0] text-white text-[clamp(2rem,4.8vw,4rem)]"
              style={{
                fontFamily: '"Starting Lineup", "Times New Roman", serif',
                fontWeight: 400,
              }}
            >
              {t.title}
            </h2>

            <p className="mt-2 font-[var(--font-be-vietnam-pro)] text-[10px] font-normal leading-[1.15] text-white sm:text-[11px] md:text-[12px]">
              {t.eyebrow}
            </p>

            <p className="mt-4 max-w-[540px] text-left font-[var(--font-be-vietnam-pro)] text-[clamp(0.85rem,1.2vw,1.15rem)] font-normal leading-[1.35] text-white sm:mt-5">
              {t.description}
            </p>

            <Link
              href={`/${locale}/mapa`}
              className="mt-5 inline-flex min-h-[34px] min-w-[116px] items-center justify-center rounded-[6px] bg-[#C028B9] px-4 py-2 text-center font-[var(--font-be-vietnam-pro)] text-[12px] font-black text-white transition hover:opacity-90 sm:min-h-[36px] sm:min-w-[124px] sm:text-[13px] md:min-h-[38px] md:min-w-[132px] md:text-[14px] lg:min-h-[40px] lg:min-w-[136px] lg:text-[15px]"
            >
              {t.button}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
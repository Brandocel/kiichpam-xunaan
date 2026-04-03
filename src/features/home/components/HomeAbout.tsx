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
        className="absolute inset-x-0 bottom-0 h-[190px] bg-repeat-x bg-bottom"
        style={{
          backgroundImage: `url(${patternBg.src})`,
          backgroundSize: "auto 190px",
        }}
      />

      <div className="relative mx-auto max-w-[1500px] px-5 pb-[150px] pt-2 md:px-8 md:pt-4 xl:px-10 xl:pb-[150px]">
        <div className="relative min-h-[460px] xl:min-h-[640px]">
          <div className="relative z-10 flex flex-col xl:min-h-[640px] xl:justify-center">
            <div className="mx-auto flex w-full max-w-[620px] flex-col items-start xl:ml-[52%] xl:max-w-[560px]">
              <h2
                className="text-white leading-none tracking-[0] text-[clamp(2.8rem,5vw,4rem)]"
                style={{
                  fontFamily: '"Starting Lineup", "Times New Roman", serif',
                  fontWeight: 400,
                }}
              >
                {t.title}
              </h2>

              <p className="mt-2 font-[var(--font-be-vietnam-pro)] text-[12px] font-normal leading-none text-white">
                {t.eyebrow}
              </p>

              <p className="mt-5 max-w-[540px] text-justify font-[var(--font-be-vietnam-pro)] text-[clamp(1rem,1.25vw,1.15rem)] font-normal leading-[1.2] text-white">
                {t.description}
              </p>

              <Link
                href={`/${locale}/mapa`}
                className="mt-6 inline-flex min-h-[38px] min-w-[136px] items-center justify-center rounded-[7px] bg-[#C028B9] px-4 py-2 text-center font-[var(--font-be-vietnam-pro)] text-[15px] font-black text-white transition hover:opacity-90"
              >
                {t.button}
              </Link>
            </div>
          </div>

          <div className="relative z-20 mx-auto mb-8 h-[380px] w-[440px] md:h-[500px] md:w-[600px] xl:absolute xl:bottom-[-70px] xl:left-[-10px] xl:mb-0 xl:h-[840px] xl:w-[740px]">
            <Image
              src="/cenote/CenoteYunChen.webp"
              alt="Cenote Yun Chen"
              fill
              priority={false}
              className="object-contain object-left-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
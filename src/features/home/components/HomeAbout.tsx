import Image from "next/image";
import Link from "next/link";

interface HomeAboutProps {
  locale?: "es" | "en";
}

const content = {
  es: {
    eyebrow: "Cenotes en Quintana Roo y Yucatán",
    title: "Ki’ichpam Xunáan",
    description:
      "¡Descubre la maravilla de los cenotes en Yucatán y Valladolid en el parque natural Ki’ichpam Xunáan! Sumérgete en un paraíso subterráneo único en nuestro parque temático. Explora pozos de agua cristalina, cavernas misteriosas y la rica cultura maya.",
    button: "Ver mapa",
  },
  en: {
    eyebrow: "Cenotes in Quintana Roo and Yucatán",
    title: "Ki’ichpam Xunáan",
    description:
      "Discover the wonder of the cenotes in Yucatán and Valladolid at Ki’ichpam Xunáan natural park! Immerse yourself in a unique underground paradise in our theme park. Explore crystal-clear water pools, mysterious caverns, and the rich Mayan culture.",
    button: "View map",
  },
} as const;

export default function HomeAbout({ locale = "es" }: HomeAboutProps) {
  const t = content[locale];

  return (
    <section className="relative overflow-hidden bg-[#005F74]">
      {/* Textura */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "url('/cenote/textura.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "1500px auto",
          backgroundPosition: "center",
        }}
      />

      {/* Contenedor */}
      <div className="relative mx-auto max-w-[1360px] px-4 py-8 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-10 xl:gap-12">
          
          {/* Imagen */}
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[561px]">
            <div className="relative aspect-[561/378] overflow-hidden rounded-[14px] shadow-[0_18px_40px_rgba(0,0,0,0.26)]">
              <Image
                src="/cenote/CenoteAbout.webp"
                alt="Cenote Ki’ichpam Xunáan"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 320px, (max-width: 768px) 400px, (max-width: 1024px) 480px, 561px"
              />
            </div>
          </div>

          {/* Texto */}
          <div className="w-full max-w-[320px] text-left sm:max-w-[420px] md:max-w-[500px] lg:max-w-[537px] xl:max-w-[580px]">
            
            {/* Título */}
            <h2
              className="whitespace-nowrap text-white leading-[0.92] tracking-[-0.02em] text-[clamp(2.2rem,4.4vw,4.6rem)]"
              style={{
                fontFamily: '"Starting Lineup", "Times New Roman", serif',
                fontWeight: 400,
              }}
            >
              {t.title}
            </h2>

            {/* Subtítulo */}
            <p className="mt-2 font-[var(--font-be-vietnam-pro)] text-[11px] font-medium leading-[1.2] text-white sm:text-[12px] md:text-[13px]">
              {t.eyebrow}
            </p>

            {/* Descripción */}
            <p className="mt-4 max-w-[700px] text-justify font-[var(--font-be-vietnam-pro)] text-[clamp(1.25rem,1.65vw,1.65rem)] font-normal leading-[1.25] text-white">
              {t.description}
            </p>

            {/* Botón */}
            <Link
              href={`/${locale}/mapa`}
              className="mt-6 inline-flex h-[48px] min-w-[230px] items-center justify-center rounded-[8px] bg-[#C028B9] px-7 font-[var(--font-be-vietnam-pro)] text-[18px] font-extrabold text-white transition hover:opacity-90 max-sm:h-[42px] max-sm:min-w-[170px] max-sm:text-[14px]"
            >
              {t.button}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
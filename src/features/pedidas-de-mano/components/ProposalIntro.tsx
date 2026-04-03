"use client";

import Image from "next/image";
import Link from "next/link";

interface ProposalIntroProps {
  locale: "es" | "en";
}

const content = {
  es: {
    title: "Cada momento es mágico",
    description:
      "Contamos con opciones que incluyen acceso exclusivo a uno de nuestros dos hermosos cenotes, donde podrán disfrutar de un entorno natural privado y mágico. Vivirán una auténtica bendición maya, una ceremonia llena de significado y energía que hará aún más especial este momento.",
    buttonText: "Galería",
    buttonHref: "/es/galeria",
    image: "/pedida-mano/cadamomento.webp",
  },
  en: {
    title: "Every moment is magical",
    description:
      "We offer options that include exclusive access to one of our two beautiful cenotes, where you can enjoy a private and magical natural setting. You will experience an authentic Mayan blessing, a ceremony full of meaning and energy that will make this moment even more special.",
    buttonText: "Gallery",
    buttonHref: "/en/galeria",
    image: "/pedida-mano/cadamomento.webp",
  },
};

export default function ProposalIntro({ locale }: ProposalIntroProps) {
  const t = content[locale];

  return (
    <section className="w-full bg-[linear-gradient(180deg,#0B3F67_0%,#005F73_100%)]">
      <div
        className="
          mx-auto grid w-full max-w-[1440px]
          grid-cols-1 items-center gap-10
          px-6 py-16
          md:grid-cols-[minmax(320px,496px)_minmax(320px,670px)]
          md:justify-center md:gap-10 md:px-10 md:py-20
          xl:gap-16 xl:px-16
        "
      >
        <div className="relative mx-auto h-[260px] w-full max-w-[496px] overflow-hidden rounded-[14px] md:h-[346px]">
          <Image
            src={t.image}
            alt={t.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 496px"
          />
        </div>

        <div className="mx-auto w-full max-w-[670px] text-white">
          <h2
            className="
              text-[30px] font-black leading-[150%]
              sm:text-[32px]
              md:text-[36px]
            "
            style={{
              fontFamily:
                '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              letterSpacing: "0%",
            }}
          >
            {t.title}
          </h2>

          <p
            className="
              mt-4 text-[16px] font-normal leading-[150%]
              sm:text-[18px]
              md:text-[20px]
            "
            style={{
              fontFamily:
                '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              letterSpacing: "0%",
            }}
          >
            {t.description}
          </p>

          <Link
            href={t.buttonHref}
            className="
              mt-6 inline-flex h-[38px] w-[204px]
              items-center justify-center
              rounded-[7px]
              px-[15.56px] py-[4.24px]
              text-center text-[15px] font-black text-white
              transition-all duration-300
              hover:brightness-110
              active:scale-[0.98]
            "
            style={{
              backgroundColor: "#C028B9",
              fontFamily:
                '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif',
              gap: "4.71px",
            }}
          >
            {t.buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
import Link from "next/link";

type PageProps = {
  params: {
    locale: "es" | "en";
  };
};

const content = {
  es: {
    eyebrow: "Soporte",
    title: "Atención al cliente",
    description:
      "Estamos para ayudarte con dudas sobre reservaciones, paquetes, pagos, promociones o información general del ecoparque.",
    cards: [
      {
        title: "WhatsApp",
        description:
          "Escríbenos por WhatsApp para recibir atención directa sobre tu visita o reservación.",
        button: "Abrir WhatsApp",
        href: "https://wa.me/5219987510867",
        external: true,
      },
      {
        title: "Contacto",
        description:
          "Visita nuestra página de contacto para consultar ubicación, redes sociales y detalles del ecoparque.",
        button: "Ir a contacto",
        href: "/contacto",
        external: false,
      },
      {
        title: "Promociones",
        description:
          "Consulta las promociones activas antes de reservar tu experiencia en Ki’ichpam Xunaán.",
        button: "Ver promociones",
        href: "/promociones",
        external: false,
      },
    ],
  },
  en: {
    eyebrow: "Support",
    title: "Customer support",
    description:
      "We are here to help you with questions about reservations, packages, payments, promotions, or general ecopark information.",
    cards: [
      {
        title: "WhatsApp",
        description:
          "Message us on WhatsApp to receive direct support about your visit or reservation.",
        button: "Open WhatsApp",
        href: "https://wa.me/5219987510867",
        external: true,
      },
      {
        title: "Contact",
        description:
          "Visit our contact page to check location, social media, and ecopark details.",
        button: "Go to contact",
        href: "/contacto",
        external: false,
      },
      {
        title: "Promotions",
        description:
          "Check active promotions before booking your Ki’ichpam Xunaán experience.",
        button: "View promotions",
        href: "/promociones",
        external: false,
      },
    ],
  },
} as const;

function withLocale(locale: "es" | "en", href: string) {
  if (href.startsWith("http")) return href;
  return `/${locale}${href}`;
}

export default function CustomerSupportPage({ params }: PageProps) {
  const locale = params.locale === "en" ? "en" : "es";
  const t = content[locale];

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[#493287] px-6 py-20 text-white sm:px-10 lg:px-16">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/footer/text.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "auto 36px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1080px]">
          <p className="font-[var(--font-poppins)] text-[14px] font-bold uppercase tracking-[0.22em] text-white/80">
            {t.eyebrow}
          </p>

          <h1 className="mt-4 max-w-3xl font-[var(--font-poppins)] text-[42px] font-extrabold leading-tight sm:text-[54px]">
            {t.title}
          </h1>

          <p className="mt-5 max-w-2xl font-[var(--font-poppins)] text-[16px] font-medium leading-relaxed text-white/90 sm:text-[18px]">
            {t.description}
          </p>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1080px] gap-6 md:grid-cols-3">
          {t.cards.map((card) => (
            <article
              key={card.title}
              className="flex min-h-[260px] flex-col rounded-[20px] border border-[#493287]/15 bg-white p-7 shadow-[0_12px_35px_rgba(73,50,135,0.08)]"
            >
              <h2 className="font-[var(--font-poppins)] text-[24px] font-extrabold text-[#493287]">
                {card.title}
              </h2>

              <p className="mt-4 flex-1 font-[var(--font-poppins)] text-[15px] font-medium leading-relaxed text-slate-600">
                {card.description}
              </p>

              <Link
                href={withLocale(locale, card.href)}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noopener noreferrer" : undefined}
                className="mt-7 inline-flex h-[42px] w-fit items-center justify-center rounded-[8px] bg-[#C028B9] px-5 font-[var(--font-poppins)] text-[14px] font-extrabold text-white transition hover:opacity-90"
              >
                {card.button}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
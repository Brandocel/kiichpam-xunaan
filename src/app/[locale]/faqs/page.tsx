import type { Metadata } from "next";
  import {
    SITE_URL,
    getFaqJsonLd,
    jsonLdScript,
    localizedUrl,
  } from "@/shared/lib/seo";

  type PageProps = {
    params: Promise<{
      locale: "es" | "en";
    }>;
  };

  const seo = {
    es: {
      title: "Preguntas frecuentes | Cenote Kiichpam Xunáan, Valladolid",
      description:
        "Respuestas sobre ubicación, cómo llegar, reservaciones, pagos y promociones del ecoparque de cenotes Kiichpam Xunáan cerca de Valladolid, Yucatán.",
    },
    en: {
      title: "Frequently Asked Questions | Cenote Kiichpam Xunáan, Valladolid",
      description:
        "Answers about location, directions, bookings, payments and promotions for the Kiichpam Xunáan cenotes ecopark near Valladolid, Yucatán.",
    },
  } as const;

  export async function generateMetadata({
    params,
  }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const safeLocale = locale === "en" ? "en" : "es";
    const s = seo[safeLocale];

    return {
      title: s.title,
      description: s.description,
      metadataBase: new URL(SITE_URL),
      alternates: {
        canonical: localizedUrl(safeLocale, "/faqs"),
        languages: {
          es: localizedUrl("es", "/faqs"),
          en: localizedUrl("en", "/faqs"),
          "x-default": localizedUrl("es", "/faqs"),
        },
      },
      openGraph: {
        title: s.title,
        description: s.description,
        url: localizedUrl(safeLocale, "/faqs"),
        siteName: "Kiichpam Xunaan",
        locale: safeLocale === "es" ? "es_MX" : "en_US",
        type: "website",
      },
      robots: { index: true, follow: true },
    };
  }

  const content = {
    es: {
      eyebrow: "Soporte",
      title: "Preguntas frecuentes",
      description:
        "Encuentra respuestas rápidas sobre reservaciones, horarios, pagos, promociones y visitas a Ki’ichpam Xunaán.",
      faqs: [
        {
          question: "¿Dónde está ubicado Ki’ichpam Xunaán?",
          answer:
            "Nos encontramos en Carretera Yalcoba-Xtut, Supermanzana km 9.5, 97794 Yalcobá, Yucatán.",
        },
        {
          question: "¿Cómo puedo llegar al ecoparque?",
          answer:
            "Puedes abrir la ruta desde Google Maps en nuestra sección de contacto o ubicación. También contamos con videos de ruta desde Cancún, Mérida y Valladolid.",
        },
        {
          question: "¿Necesito reservar antes de visitar?",
          answer:
            "Sí, recomendamos reservar con anticipación para asegurar disponibilidad en la fecha de tu visita.",
        },
        {
          question: "¿Aceptan pagos en línea?",
          answer:
            "Sí, puedes realizar tu proceso de reservación y pago desde nuestra plataforma cuando esté disponible para el paquete seleccionado.",
        },
        {
          question: "¿Hay promociones disponibles?",
          answer:
            "Sí, las promociones activas se muestran en la sección de promociones del sitio web.",
        },
        {
          question: "¿Puedo cambiar los datos de mi reservación?",
          answer:
            "Sí, puedes contactar a atención al cliente para revisar si es posible modificar tu reservación.",
        },
      ],
    },
    en: {
      eyebrow: "Support",
      title: "Frequently Asked Questions",
      description:
        "Find quick answers about reservations, schedules, payments, promotions, and visits to Ki’ichpam Xunaán.",
      faqs: [
        {
          question: "Where is Ki’ichpam Xunaán located?",
          answer:
            "We are located at Carretera Yalcoba-Xtut, Supermanzana km 9.5, 97794 Yalcobá, Yucatán.",
        },
        {
          question: "How can I get to the ecopark?",
          answer:
            "You can open the route from Google Maps in our contact or location section. We also have route videos from Cancun, Merida, and Valladolid.",
        },
        {
          question: "Do I need to book before visiting?",
          answer:
            "Yes, we recommend booking in advance to secure availability for your visit date.",
        },
        {
          question: "Do you accept online payments?",
          answer:
            "Yes, you can complete your reservation and payment process from our platform when available for the selected package.",
        },
        {
          question: "Are there any promotions available?",
          answer:
            "Yes, active promotions are displayed in the promotions section of the website.",
        },
        {
          question: "Can I change my reservation details?",
          answer:
            "Yes, you can contact customer support to check if your reservation can be modified.",
        },
      ],
    },
  } as const;
  
  export default async function FaqsPage({ params }: PageProps) {
    const { locale: rawLocale } = await params;
    const locale = rawLocale === "en" ? "en" : "es";
    const t = content[locale];

    return (
      <main className="min-h-screen bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(getFaqJsonLd(t.faqs))}
        />
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
          <div className="mx-auto grid max-w-[1080px] gap-5">
            {t.faqs.map((faq, index) => (
              <article
                key={faq.question}
                className="rounded-[18px] border border-[#493287]/15 bg-white p-6 shadow-[0_12px_35px_rgba(73,50,135,0.08)]"
              >
                <div className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#493287] font-[var(--font-poppins)] text-[14px] font-extrabold text-white">
                    {index + 1}
                  </span>
  
                  <div>
                    <h2 className="font-[var(--font-poppins)] text-[18px] font-extrabold leading-snug text-[#493287]">
                      {faq.question}
                    </h2>
  
                    <p className="mt-3 font-[var(--font-poppins)] text-[15px] font-medium leading-relaxed text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }
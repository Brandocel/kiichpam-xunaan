// src/app/[locale]/contacto/page.tsx

import type { Metadata } from "next";
import Header from "@/shared/components/layout/Header";
import ContactHero from "@/features/contact/components/ContactHero";
import ContactForm from "@/features/contact/components/ContactForm";

const SITE_URL = "https://www.cenotexunaan.com";

type Locale = "es" | "en";

interface Props {
  params: Promise<{
    locale: Locale;
  }>;
}

const seoContent = {
  es: {
    title: "Contacto y reservaciones | Cenote Kiichpam Xunáan, Valladolid",
    description:
      "Contáctanos para reservar tu visita a los cenotes de Kiichpam Xunáan en Valladolid, Yucatán. Resolvemos tus dudas sobre tours, grupos y horarios.",
    keywords: [
      "contacto cenote valladolid",
      "reservar cenote valladolid",
      "telefono cenotes valladolid",
      "Cenote Kiichpam Xunáan contacto",
    ],
  },
  en: {
    title: "Contact and bookings | Cenote Kiichpam Xunáan, Valladolid",
    description:
      "Contact us to book your visit to the cenotes of Kiichpam Xunáan in Valladolid, Yucatán. We answer your questions about tours, groups and schedules.",
    keywords: [
      "contact cenote valladolid",
      "book cenote valladolid",
      "Cenote Kiichpam Xunaan contact",
    ],
  },
} as const;

function getUrl(locale: Locale) {
  return `${SITE_URL}/${locale}/contacto`;
}

function normalizeLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "es";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = normalizeLocale(resolvedParams.locale);
  const seo = seoContent[locale];

  return {
    title: seo.title,
    description: seo.description,
    keywords: [...seo.keywords],
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: getUrl(locale),
      languages: {
        es: getUrl("es"),
        en: getUrl("en"),
        "x-default": getUrl("es"),
      },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: getUrl(locale),
      siteName: "Kiichpam Xunaan",
      locale: locale === "es" ? "es_MX" : "en_US",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function ContactoPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = normalizeLocale(resolvedParams.locale);

  return (
    <div className="min-h-screen bg-[#006f82]">
      <div className="relative">
        <Header locale={locale} />
        <ContactHero />
      </div>

      <ContactForm key={locale} locale={locale} />
    </div>
  );
}
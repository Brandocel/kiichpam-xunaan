import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CenotesPageView,
  getCenotesPageContent,
} from "../../../features/cenotes";

const SITE_URL = "https://www.cenotexunaan.com";

type Locale = "es" | "en";

interface CenotesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

function isValidLocale(locale: string): locale is Locale {
  return locale === "es" || locale === "en";
}

function getUrl(locale: Locale) {
  return `${SITE_URL}/${locale}/cenotes`;
}

// SEO basado en tus keywords reales (Grupo 1 Valladolid + Grupo 2 Yucatán).
const seoContent = {
  es: {
    title: "Cenotes en Valladolid, Yucatán | Cenote Kiichpam Xunáan",
    description:
      "Visita los cenotes de Kiichpam Xunáan cerca de Valladolid, Yucatán. Aguas cristalinas, selva y cultura maya. Reserva tu visita a los cenotes Xkokay y Yun Chen.",
    keywords: [
      "cenotes valladolid",
      "cenote valladolid",
      "cenotes en valladolid",
      "cenotes cerca de valladolid yucatán",
      "cenote valladolid yucatan",
      "cenotes yucatan",
      "cenote yucatán",
      "cenotes de yucatan",
      "cenotes cerca de chichen itza",
      "Cenote Kiichpam Xunáan",
    ],
  },
  en: {
    title: "Cenotes in Valladolid, Yucatán | Cenote Kiichpam Xunáan",
    description:
      "Discover the cenotes of Kiichpam Xunáan near Valladolid, Yucatán. Crystal-clear waters, jungle and Mayan culture. Book your visit to the Xkokay and Yun Chen cenotes.",
    keywords: [
      "cenotes valladolid",
      "cenotes near valladolid",
      "cenotes valladolid yucatan",
      "cenotes yucatan",
      "yucatan cenotes",
      "cenotes near chichen itza",
      "Cenote Kiichpam Xunaan",
    ],
  },
} as const;

export async function generateMetadata({
  params,
}: CenotesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = locale === "en" ? "en" : "es";
  const seo = seoContent[safeLocale];

  return {
    title: seo.title,
    description: seo.description,
    keywords: [...seo.keywords],
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: getUrl(safeLocale),
      languages: {
        es: getUrl("es"),
        en: getUrl("en"),
        "x-default": getUrl("es"),
      },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: getUrl(safeLocale),
      siteName: "Kiichpam Xunaan",
      locale: safeLocale === "es" ? "es_MX" : "en_US",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/cenotepage/CenoteXkokay.webp`,
          width: 1200,
          height: 630,
          alt: "Cenotes Kiichpam Xunáan, Valladolid, Yucatán",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [`${SITE_URL}/cenotepage/CenoteXkokay.webp`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function CenotesPage({ params }: CenotesPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const content = getCenotesPageContent(locale);
  const seo = seoContent[locale];

  // Datos estructurados para que Google entienda que eres una atracción
  // turística local en Valladolid (ayuda a salir en resultados locales).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Cenote Kiichpam Xunáan",
    url: getUrl(locale),
    description: seo.description,
    image: `${SITE_URL}/cenotepage/CenoteXkokay.webp`,
    touristType: ["Families", "Couples", "Groups", "Adventure travelers"],
    availableLanguage: ["Spanish", "English"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Valladolid",
      addressRegion: "Yucatán",
      addressCountry: "MX",
    },
    // TODO: reemplaza por las coordenadas EXACTAS de tu cenote
    // (cópialas de Google Maps: clic derecho en el pin → primeras 2 cifras).
    geo: {
      "@type": "GeoCoordinates",
      latitude: 20.6896,
      longitude: -88.2011,
    },
    // NOTA: no inventes reseñas. Cuando tengas reseñas reales en tu
    // Perfil de Empresa de Google, agrega aquí "aggregateRating" con el
    // promedio y el número real de reseñas para mostrar estrellas.
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <CenotesPageView content={content} locale={locale} />
    </>
  );
}

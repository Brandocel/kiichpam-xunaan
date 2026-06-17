import type { Metadata } from "next";
import { MapPageView } from "@/features/mapa";

const SITE_URL = "https://www.cenotexunaan.com";

type Locale = "es" | "en";

type PageProps = {
  params: Promise<{
    locale: "es" | "en";
  }>;
};

const seoContent = {
  es: {
    title: "Cómo llegar | Cenote Kiichpam Xunáan en Valladolid, Yucatán",
    description:
      "Ubicación y mapa para llegar al Cenote Kiichpam Xunáan cerca de Valladolid, Yucatán, en la ruta hacia Chichén Itzá. Cómo llegar en auto y referencias.",
    keywords: [
      "como llegar cenote valladolid",
      "ubicacion cenotes valladolid",
      "mapa cenotes yucatan",
      "cenotes cerca de chichen itza",
      "Cenote Kiichpam Xunáan ubicación",
    ],
  },
  en: {
    title: "How to get there | Cenote Kiichpam Xunáan in Valladolid, Yucatán",
    description:
      "Location and map to reach Cenote Kiichpam Xunáan near Valladolid, Yucatán, on the way to Chichén Itzá. How to get there by car and landmarks.",
    keywords: [
      "how to get to cenote valladolid",
      "cenotes valladolid location",
      "cenotes map yucatan",
      "cenotes near chichen itza",
      "Cenote Kiichpam Xunaan location",
    ],
  },
} as const;

function getUrl(locale: Locale) {
  return `${SITE_URL}/${locale}/mapa`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
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
    },
    robots: { index: true, follow: true },
  };
}

export default async function MapaPage({ params }: PageProps) {
  const { locale } = await params;

  return <MapPageView locale={locale} />;
}
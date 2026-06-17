import type { Metadata } from "next";
import { BookingSection } from "@/features/booking";
import { getPackages } from "@/features/home/services/home.service";

const SITE_URL = "https://www.cenotexunaan.com";

type Locale = "es" | "en";

interface ReservarPageProps {
  params: Promise<{
    locale: "es" | "en";
  }>;
  searchParams: Promise<{
    packageCode?: string;
  }>;
}

const seoContent = {
  es: {
    title: "Reserva tu visita | Cenotes Kiichpam Xunáan, Valladolid Yucatán",
    description:
      "Reserva en línea tu visita y tours a los cenotes de Kiichpam Xunáan cerca de Valladolid, Yucatán. Paquetes de aventura, grupos y experiencias mayas.",
    keywords: [
      "reservar cenote valladolid",
      "tour cenotes valladolid",
      "tours cenotes yucatan",
      "paquetes cenotes valladolid",
      "Cenote Kiichpam Xunáan reservar",
    ],
  },
  en: {
    title: "Book your visit | Kiichpam Xunáan Cenotes, Valladolid Yucatán",
    description:
      "Book your visit and tours to the cenotes of Kiichpam Xunáan near Valladolid, Yucatán. Adventure packages, groups and Mayan experiences.",
    keywords: [
      "book cenote valladolid",
      "cenote tours valladolid",
      "cenotes tours yucatan",
      "Cenote Kiichpam Xunaan booking",
    ],
  },
} as const;

function getUrl(locale: Locale) {
  return `${SITE_URL}/${locale}/reservar`;
}

export async function generateMetadata({
  params,
}: ReservarPageProps): Promise<Metadata> {
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

export default async function ReservarPage({
  params,
  searchParams,
}: ReservarPageProps) {
  const { locale } = await params;
  const { packageCode = "" } = await searchParams;

  const packages = await getPackages(locale);

  return (
    <BookingSection
      locale={locale}
      packages={packages}
      initialPackageCode={packageCode}
    />
  );
}
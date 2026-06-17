import type { Metadata } from "next";
import ProposalPageView from "../../../features/pedidas-de-mano/components/ProposalPageView";

const SITE_URL = "https://www.cenotexunaan.com";

type Locale = "es" | "en";

interface ProposalPageProps {
  params: Promise<{
    locale: "es" | "en";
  }>;
}

const seoContent = {
  es: {
    title: "Pedida de mano en cenote | Kiichpam Xunáan, Valladolid Yucatán",
    description:
      "Haz tu propuesta de matrimonio en un cenote único cerca de Valladolid, Yucatán. Decoración, fotografía y un escenario natural inolvidable en Kiichpam Xunáan.",
    keywords: [
      "pedida de mano en cenote",
      "propuesta de matrimonio en cenote",
      "pedida de mano valladolid yucatan",
      "lugares para pedida de mano yucatan",
      "propuesta de matrimonio cenote yucatán",
    ],
  },
  en: {
    title: "Marriage proposal in a cenote | Kiichpam Xunáan, Valladolid",
    description:
      "Plan your marriage proposal in a unique cenote near Valladolid, Yucatán. Decoration, photography and an unforgettable natural setting at Kiichpam Xunáan.",
    keywords: [
      "marriage proposal in a cenote",
      "proposal cenote yucatan",
      "romantic cenote valladolid",
      "proposal ideas yucatan",
    ],
  },
} as const;

function getUrl(locale: Locale) {
  return `${SITE_URL}/${locale}/pedidas-de-mano`;
}

export async function generateMetadata({
  params,
}: ProposalPageProps): Promise<Metadata> {
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

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { locale } = await params;

  return <ProposalPageView locale={locale} />;
}
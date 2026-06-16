// src/app/[locale]/page.tsx

import type { Metadata } from "next";
import HomePageView from "../../features/home/components/HomePageView";
import {
  getHeroSlides,
  getPackages,
} from "../../features/home/services/home.service";

const SITE_URL = "https://www.cenotexunaan.com";

type Locale = "es" | "en";

interface HomePageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

const seoContent = {
  es: {
    title: "Kiichpam Xunaan | Cenotes, aventura y experiencias mayas",
    description:
      "Vive Kiichpam Xunaan, un parque natural con cenotes, experiencias mayas, paquetes de aventura, galería, grupos y pedidas de mano en un entorno único.",
    keywords: [
      "Kiichpam Xunaan",
      "cenotes",
      "cenotes en Yucatán",
      "parque natural",
      "experiencias mayas",
      "pedidas de mano",
      "tours cenotes",
      "aventura KX",
    ],
  },
  en: {
    title: "Kiichpam Xunaan | Cenotes, adventure and Mayan experiences",
    description:
      "Discover Kiichpam Xunaan, a natural park with cenotes, Mayan experiences, adventure packages, gallery, groups and proposal experiences.",
    keywords: [
      "Kiichpam Xunaan",
      "cenotes",
      "Yucatan cenotes",
      "natural park",
      "Mayan experiences",
      "proposal packages",
      "cenote tours",
      "KX adventure",
    ],
  },
};

function normalizeLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "es";
}

function getUrl(locale: Locale) {
  return `${SITE_URL}/${locale}`;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = normalizeLocale(resolvedParams.locale);
  const seo = seoContent[locale];

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
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
      images: [
        {
          url: `${SITE_URL}/og/home.jpg`,
          width: 1200,
          height: 630,
          alt: "Kiichpam Xunaan",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [`${SITE_URL}/og/home.jpg`],
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

/**
 * Para probar traducciones en vivo, déjalo dinámico.
 * Cuando todo esté estable, puedes volver a usar revalidate = 3600 si quieres cache.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage({ params }: HomePageProps) {
  const resolvedParams = await params;
  const locale = normalizeLocale(resolvedParams.locale);

  const [slides, packageItems] = await Promise.all([
    getHeroSlides(locale),
    getPackages(locale),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Kiichpam Xunaan",
    url: getUrl(locale),
    description: seoContent[locale].description,
    image: `${SITE_URL}/og/home.jpg`,
    touristType: ["Families", "Couples", "Groups", "Adventure travelers"],
    availableLanguage: ["Spanish", "English"],
    address: {
      "@type": "PostalAddress",
      addressCountry: "MX",
      addressRegion: "Yucatán",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "es" ? "Paquetes de aventura" : "Adventure packages",
      itemListElement: packageItems.map((item, index) => ({
        "@type": "Offer",
        position: index + 1,
        name: item.translation?.name || item.code,
        price: (item.adultPriceMXN / 100).toFixed(2),
        priceCurrency: item.currency,
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/${locale}/reservar?packageCode=${encodeURIComponent(
          item.code,
        )}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <HomePageView
        heroSlides={slides}
        packageItems={packageItems}
        locale={locale}
      />
    </>
  );
}
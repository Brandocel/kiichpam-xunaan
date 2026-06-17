import type { Metadata } from "next";
import type { ReactNode } from "react";
import Footer from "@/shared/components/layout/Footer";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  getTouristAttractionJsonLd,
  getWebSiteJsonLd,
  jsonLdScript,
  localizedUrl,
  siteDescription,
  type Locale,
} from "@/shared/lib/seo";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

function normalizeLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "es";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = normalizeLocale(locale);
  const description = siteDescription(safeLocale);
  const title =
    safeLocale === "es"
      ? "Kiichpam Xunaan | Cenotes cerca de Valladolid, Yucatán"
      : "Kiichpam Xunaan | Cenotes near Valladolid, Yucatán";

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: SITE_NAME,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
    alternates: {
      canonical: localizedUrl(safeLocale),
      languages: {
        es: localizedUrl("es"),
        en: localizedUrl("en"),
        "x-default": localizedUrl("es"),
      },
    },
    openGraph: {
      title,
      description,
      url: localizedUrl(safeLocale),
      siteName: SITE_NAME,
      locale: safeLocale === "es" ? "es_MX" : "en_US",
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
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

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const safeLocale = normalizeLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          getTouristAttractionJsonLd(safeLocale),
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(getWebSiteJsonLd(safeLocale))}
      />
      <main className="flex-1">{children}</main>
      <Footer locale={safeLocale} />
    </div>
  );
}

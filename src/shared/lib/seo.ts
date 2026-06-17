// Módulo central de SEO. Aquí viven los datos del negocio y los generadores
// de datos estructurados (JSON-LD) que se inyectan en todo el sitio.

export type Locale = "es" | "en";

export const SITE_URL = "https://www.cenotexunaan.com";
export const SITE_NAME = "Kiichpam Xunaan";
export const LEGAL_NAME = "HOKA ILUSIONES SA DE CV";

// Imagen por defecto para compartir en redes (Open Graph / Twitter).
// 1200x630 sería lo ideal; usamos una imagen real existente.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/home/home.webp`;
export const LOGO_URL = `${SITE_URL}/KXXNlogo.svg`;

// Teléfono de contacto (WhatsApp), formato internacional E.164.
export const PHONE = "+529987510867";

// Redes sociales (para el campo sameAs → ayuda a Google a identificar la marca).
export const SOCIAL_PROFILES = [
  "https://www.instagram.com/kiichpamxunaan/",
  "https://www.facebook.com/kiichpamxunaan",
  "https://www.tiktok.com/@kiichpamxunaan",
];

// Dirección real del ecoparque (tomada de las FAQ).
export const ADDRESS = {
  streetAddress: "Carretera Yalcoba-Xtut, Supermanzana km 9.5",
  addressLocality: "Valladolid",
  addressRegion: "Yucatán",
  postalCode: "97794",
  addressCountry: "MX",
};

// TODO: reemplaza por las coordenadas EXACTAS del cenote (cópialas de Google
// Maps: clic derecho sobre el pin → la primera línea son lat, lng).
export const GEO = {
  latitude: 20.77,
  longitude: -88.1,
};

const DESCRIPTIONS: Record<Locale, string> = {
  es: "Kiichpam Xunaan, ecoparque con cenotes cerca de Valladolid, Yucatán. Aguas cristalinas, experiencias mayas, tours, grupos y pedidas de mano. Reserva en línea.",
  en: "Kiichpam Xunaan, an ecopark with cenotes near Valladolid, Yucatán. Crystal-clear waters, Mayan experiences, tours, groups and marriage proposals. Book online.",
};

export function siteDescription(locale: Locale) {
  return DESCRIPTIONS[locale];
}

export function localizedUrl(locale: Locale, path = "") {
  return `${SITE_URL}/${locale}${path}`;
}

// Entidad principal del negocio: aparece en todo el sitio.
export function getTouristAttractionJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "@id": `${SITE_URL}/#business`,
    name: "Cenote Kiichpam Xunáan",
    legalName: LEGAL_NAME,
    url: localizedUrl(locale),
    description: DESCRIPTIONS[locale],
    image: DEFAULT_OG_IMAGE,
    logo: LOGO_URL,
    telephone: PHONE,
    priceRange: "$$",
    currenciesAccepted: "MXN",
    touristType: ["Families", "Couples", "Groups", "Adventure travelers"],
    availableLanguage: ["Spanish", "English"],
    sameAs: SOCIAL_PROFILES,
    address: {
      "@type": "PostalAddress",
      ...ADDRESS,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
    // NOTA: no agregues "aggregateRating" con reseñas inventadas (Google penaliza).
    // Cuando tengas reseñas reales en tu Perfil de Empresa, agrégalo aquí.
  };
}

// Identidad del sitio web (ayuda al reconocimiento de marca).
export function getWebSiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: locale === "es" ? "es-MX" : "en-US",
    publisher: { "@id": `${SITE_URL}/#business` },
  };
}

// Generador de FAQPage (habilita el rich snippet de preguntas en Google).
export function getFaqJsonLd(faqs: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Generador de migas de pan (BreadcrumbList).
export function getBreadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Helper para serializar JSON-LD de forma segura dentro de un <script>.
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

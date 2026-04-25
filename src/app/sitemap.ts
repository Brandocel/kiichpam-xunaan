import type { MetadataRoute } from "next";

const SITE_URL = "https://kiichpam-xunaan.com";

type RouteConfig = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const routes: RouteConfig[] = [
  {
    path: "",
    changeFrequency: "daily",
    priority: 1,
  },
  {
    path: "/cenotes",
    changeFrequency: "weekly",
    priority: 0.95,
  },
  {
    path: "/pedidas-de-mano",
    changeFrequency: "weekly",
    priority: 0.95,
  },
  {
    path: "/galeria",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/grupos",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/mapa",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/reservar",
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    path: "/contacto",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/blog",
    changeFrequency: "weekly",
    priority: 0.75,
  },
];

const locales = ["es", "en"] as const;

function buildUrl(locale: "es" | "en", path: string) {
  return `${SITE_URL}/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const localizedRoutes = routes.flatMap((route) =>
    locales.map((locale) => ({
      url: buildUrl(locale, route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          es: buildUrl("es", route.path),
          en: buildUrl("en", route.path),
          "x-default": buildUrl("es", route.path),
        },
      },
    })),
  );

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          es: `${SITE_URL}/es`,
          en: `${SITE_URL}/en`,
          "x-default": `${SITE_URL}/es`,
        },
      },
    },
    ...localizedRoutes,
  ];
}
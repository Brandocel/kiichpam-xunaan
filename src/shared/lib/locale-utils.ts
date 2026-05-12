export const SUPPORTED_LOCALES = ["es", "en"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "es";

export const LOCALE_STORAGE_KEY = "kiichpam_locale";
export const LOCALE_COOKIE_KEY = "kiichpam_locale";

export function isAppLocale(value?: string | null): value is AppLocale {
  if (!value) return false;

  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function getLocaleFromPathname(pathname?: string | null): AppLocale | null {
  if (!pathname) return null;

  const firstSegment = pathname.split("/").filter(Boolean)[0];

  return isAppLocale(firstSegment) ? firstSegment : null;
}

export function removeLocaleFromPathname(pathname?: string | null) {
  if (!pathname || pathname === "/") return "";

  const segments = pathname.split("/").filter(Boolean);

  if (isAppLocale(segments[0])) {
    segments.shift();
  }

  const cleanPath = segments.join("/");

  return cleanPath ? `/${cleanPath}` : "";
}

export function buildLocalizedHref(locale: AppLocale, href: string) {
  const cleanHref = href.startsWith("/") ? href : `/${href}`;

  if (cleanHref === "/") {
    return `/${locale}`;
  }

  return `/${locale}${cleanHref}`;
}

export function buildLocalizedPathFromCurrentPath(
  locale: AppLocale,
  pathname?: string | null,
  queryString?: string
) {
  const cleanPath = removeLocaleFromPathname(pathname);
  const query = queryString ? `?${queryString}` : "";

  return `/${locale}${cleanPath}${query}`;
}

export function getPreferredLocaleFromBrowser(): AppLocale | null {
  if (typeof window === "undefined") return null;

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

    if (isAppLocale(storedLocale)) {
      return storedLocale;
    }

    const cookieLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${LOCALE_COOKIE_KEY}=`))
      ?.split("=")[1];

    if (isAppLocale(cookieLocale)) {
      return cookieLocale;
    }

    const browserLanguage = window.navigator.language.toLowerCase();

    if (browserLanguage.startsWith("en")) {
      return "en";
    }

    if (browserLanguage.startsWith("es")) {
      return "es";
    }

    return null;
  } catch {
    return null;
  }
}

export function savePreferredLocale(locale: AppLocale) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);

    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Evita romper la app si el navegador bloquea storage/cookies.
  }
}
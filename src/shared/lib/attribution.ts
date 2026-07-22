export type AttributionData = {
  source?: string;
  sourceLabel?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;

  metaCampaignId?: string;
  metaAdsetId?: string;
  metaAdId?: string;
  metaPlacement?: string;

  fbclid?: string;
  ttclid?: string;
  gclid?: string;

  referrer?: string;
  landingPage?: string;
  capturedAt?: string;
  expiresAt?: string;
};

export type ReservationAttributionPayload = {
  reference?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  ttclid?: string;
  gclid?: string;
  landingPage?: string;
  referrer?: string;
};

const ATTRIBUTION_STORAGE_KEY = "kiichpam_attribution";
const ATTRIBUTION_TTL_DAYS = 30;

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isExpired(expiresAt?: string) {
  if (!expiresAt) return false;

  const expiresDate = new Date(expiresAt);

  if (Number.isNaN(expiresDate.getTime())) {
    return false;
  }

  return expiresDate.getTime() < Date.now();
}

function getSearchParam(url: URL, key: string) {
  const value = url.searchParams.get(key);
  return value && value.trim() !== "" ? value.trim() : undefined;
}

type NormalizeSourceParams = {
  rawSource?: string;
  medium?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
};

// Define el origen con esta prioridad (de más confiable a menos):
//   1) utm_source explícito en el link
//   2) click IDs (gclid/fbclid/ttclid) — funcionan aunque el referrer venga vacío
//   3) referrer (la página de la que vino) — poco confiable, se adivina
//   4) Directo (no se pudo determinar)
function normalizeSource({
  rawSource,
  medium,
  referrer,
  gclid,
  fbclid,
  ttclid,
}: NormalizeSourceParams) {
  const source = rawSource?.toLowerCase();
  const normalizedMedium = medium?.toLowerCase();
  const isPaid =
    normalizedMedium === "cpc" ||
    normalizedMedium === "ppc" ||
    normalizedMedium === "paid";

  // 1) utm_source explícito (lo más confiable)
  if (source === "fb" || source === "facebook") {
    return {
      source: isPaid ? "facebook_ads" : "facebook",
      sourceLabel: isPaid ? "Facebook Ads" : "Facebook",
    };
  }

  if (source === "ig" || source === "instagram") {
    return {
      source: isPaid ? "instagram_ads" : "instagram",
      sourceLabel: isPaid ? "Instagram Ads" : "Instagram",
    };
  }

  if (source === "tiktok" || source === "tt") {
    return {
      source: isPaid ? "tiktok_ads" : "tiktok",
      sourceLabel: isPaid ? "TikTok Ads" : "TikTok",
    };
  }

  if (source === "whatsapp" || source === "wa") {
    return {
      source: "whatsapp",
      sourceLabel: "WhatsApp",
    };
  }

  if (source === "google") {
    // Google pagado (Ads) vs Google orgánico (búsqueda gratis)
    return isPaid || gclid
      ? { source: "google_ads", sourceLabel: "Google Ads" }
      : { source: "google", sourceLabel: "Google" };
  }

  if (source === "direct" || source === "directo") {
    return {
      source: "direct",
      sourceLabel: "Directo",
    };
  }

  if (source === "web" || source === "website" || source === "pagina web") {
    return {
      source: "web",
      sourceLabel: "Pagina WEB",
    };
  }

  if (source) {
    return {
      source,
      sourceLabel: source,
    };
  }

  // 2) Click IDs: deterministas aunque no haya utm ni referrer.
  // gclid SOLO lo agrega Google Ads → siempre es tráfico pagado.
  if (gclid) {
    return {
      source: "google_ads",
      sourceLabel: "Google Ads",
    };
  }

  if (fbclid) {
    return {
      source: "facebook",
      sourceLabel: "Facebook",
    };
  }

  if (ttclid) {
    return {
      source: "tiktok",
      sourceLabel: "TikTok",
    };
  }

  // 3) Referrer (adivinanza, poco confiable)
  const normalizedReferrer = referrer?.toLowerCase();

  if (normalizedReferrer?.includes("facebook.com")) {
    return {
      source: "facebook",
      sourceLabel: "Facebook",
    };
  }

  if (normalizedReferrer?.includes("instagram.com")) {
    return {
      source: "instagram",
      sourceLabel: "Instagram",
    };
  }

  if (normalizedReferrer?.includes("tiktok.com")) {
    return {
      source: "tiktok",
      sourceLabel: "TikTok",
    };
  }

  if (normalizedReferrer?.includes("whatsapp.com")) {
    return {
      source: "whatsapp",
      sourceLabel: "WhatsApp",
    };
  }

  if (normalizedReferrer?.includes("google.")) {
    return {
      source: "google",
      sourceLabel: "Google",
    };
  }

  // 4) No se pudo determinar
  return {
    source: "direct",
    sourceLabel: "Directo",
  };
}

function cleanPayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      return value !== undefined && value !== null && value !== "";
    })
  ) as Partial<T>;
}

export function getStoredAttribution(): AttributionData | null {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);

    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as AttributionData;

    if (isExpired(parsed.expiresAt)) {
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredAttribution() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
}

export function captureAttributionFromCurrentUrl() {
  if (typeof window === "undefined") return null;

  const currentUrl = new URL(window.location.href);
  const referrer = document.referrer || undefined;

  const utmSource = getSearchParam(currentUrl, "utm_source");
  const utmMedium = getSearchParam(currentUrl, "utm_medium");
  const utmCampaign = getSearchParam(currentUrl, "utm_campaign");
  const utmContent = getSearchParam(currentUrl, "utm_content");
  const utmTerm = getSearchParam(currentUrl, "utm_term");

  const metaCampaignId = getSearchParam(currentUrl, "meta_campaign_id");
  const metaAdsetId = getSearchParam(currentUrl, "meta_adset_id");
  const metaAdId = getSearchParam(currentUrl, "meta_ad_id");
  const metaPlacement = getSearchParam(currentUrl, "meta_placement");

  const fbclid = getSearchParam(currentUrl, "fbclid");
  const ttclid = getSearchParam(currentUrl, "ttclid");
  const gclid = getSearchParam(currentUrl, "gclid");

  const hasCampaignData =
    Boolean(utmSource) ||
    Boolean(utmMedium) ||
    Boolean(utmCampaign) ||
    Boolean(utmContent) ||
    Boolean(utmTerm) ||
    Boolean(metaCampaignId) ||
    Boolean(metaAdsetId) ||
    Boolean(metaAdId) ||
    Boolean(metaPlacement) ||
    Boolean(fbclid) ||
    Boolean(ttclid) ||
    Boolean(gclid);

  const existingAttribution = getStoredAttribution();

  if (!hasCampaignData && existingAttribution) {
    return existingAttribution;
  }

  const sourceData = normalizeSource({
    rawSource: utmSource,
    medium: utmMedium,
    referrer,
    gclid,
    fbclid,
    ttclid,
  });
  const now = new Date();

  const attribution: AttributionData = {
    source: sourceData.source,
    sourceLabel: sourceData.sourceLabel,
    medium: utmMedium,
    campaign: utmCampaign,
    content: utmContent,
    term: utmTerm,

    metaCampaignId,
    metaAdsetId,
    metaAdId,
    metaPlacement,

    fbclid,
    ttclid,
    gclid,

    referrer,
    landingPage: window.location.href,
    capturedAt: now.toISOString(),
    expiresAt: addDays(now, ATTRIBUTION_TTL_DAYS).toISOString(),
  };

  window.localStorage.setItem(
    ATTRIBUTION_STORAGE_KEY,
    JSON.stringify(attribution)
  );

  return attribution;
}

export function buildReservationAttributionPayload(): ReservationAttributionPayload {
  if (typeof window === "undefined") {
    return {
      reference: "Pagina WEB",
    };
  }

  const attribution =
    captureAttributionFromCurrentUrl() ?? getStoredAttribution();

  if (!attribution) {
    return {
      reference: "Pagina WEB",
    };
  }

  const reference =
    attribution.sourceLabel ??
    attribution.source ??
    (attribution.fbclid
      ? "Facebook"
      : attribution.ttclid
        ? "TikTok"
        : attribution.gclid
          ? "Google"
          : "Pagina WEB");

  return cleanPayload({
    reference,
    utmSource: attribution.source,
    utmMedium: attribution.medium,
    utmCampaign: attribution.campaign,
    utmContent: attribution.content,
    utmTerm: attribution.term,
    fbclid: attribution.fbclid,
    ttclid: attribution.ttclid,
    gclid: attribution.gclid,
    landingPage: attribution.landingPage,
    referrer: attribution.referrer,
  });
}
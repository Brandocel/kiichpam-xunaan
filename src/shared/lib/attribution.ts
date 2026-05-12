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
  
  function normalizeSource(rawSource?: string, referrer?: string) {
    const source = rawSource?.toLowerCase();
  
    if (source === "fb" || source === "facebook") {
      return {
        source: "facebook",
        sourceLabel: "Facebook",
      };
    }
  
    if (source === "ig" || source === "instagram") {
      return {
        source: "instagram",
        sourceLabel: "Instagram",
      };
    }
  
    if (source === "tiktok" || source === "tt") {
      return {
        source: "tiktok",
        sourceLabel: "TikTok",
      };
    }
  
    if (source === "whatsapp" || source === "wa") {
      return {
        source: "whatsapp",
        sourceLabel: "WhatsApp",
      };
    }
  
    if (source === "google") {
      return {
        source: "google",
        sourceLabel: "Google",
      };
    }
  
    if (source) {
      return {
        source,
        sourceLabel: source,
      };
    }
  
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
  
    return {
      source: "direct",
      sourceLabel: "Directo",
    };
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
  
    const sourceData = normalizeSource(utmSource, referrer);
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
export type MetaPixelStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "Lead"
  | "Contact"
  | "InitiateCheckout"
  | "AddToCart"
  | "Purchase"
  | "CompleteRegistration";

export type MetaPixelParams = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function cleanParams(params?: MetaPixelParams) {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined && value !== null && value !== "";
    })
  );
}

export function metaPixelTrack(
  eventName: MetaPixelStandardEvent,
  params?: MetaPixelParams
) {
  if (typeof window === "undefined") return;

  if (typeof window.fbq !== "function") {
    return;
  }

  const cleanedParams = cleanParams(params);

  if (cleanedParams) {
    window.fbq("track", eventName, cleanedParams);
    return;
  }

  window.fbq("track", eventName);
}

export function metaPixelTrackCustom(
  eventName: string,
  params?: MetaPixelParams
) {
  if (typeof window === "undefined") return;

  if (typeof window.fbq !== "function") {
    return;
  }

  const cleanedParams = cleanParams(params);

  if (cleanedParams) {
    window.fbq("trackCustom", eventName, cleanedParams);
    return;
  }

  window.fbq("trackCustom", eventName);
}

export function trackReservationView(packageName?: string) {
  metaPixelTrack("ViewContent", {
    content_name: packageName || "Reserva",
    content_category: "Booking",
  });
}

export function trackReservationLead(packageName?: string) {
  metaPixelTrack("Lead", {
    content_name: packageName || "Formulario de reserva",
    content_category: "Booking",
  });
}

export function trackInitiateCheckout(params: {
  value?: number;
  currency?: string;
  packageName?: string;
  folio?: string;
}) {
  metaPixelTrack("InitiateCheckout", {
    value: params.value,
    currency: params.currency || "MXN",
    content_name: params.packageName || "Reserva",
    content_category: "Booking",
    folio: params.folio,
  });
}

export function trackPurchase(params: {
  value?: number;
  currency?: string;
  packageName?: string;
  folio?: string;
}) {
  metaPixelTrack("Purchase", {
    value: params.value,
    currency: params.currency || "MXN",
    content_name: params.packageName || "Reserva confirmada",
    content_category: "Booking",
    folio: params.folio,
  });
}

export function trackContact(source?: string) {
  metaPixelTrack("Contact", {
    content_name: "Contacto",
    content_category: source || "Website",
  });
}
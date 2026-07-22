import type { ApiReservation } from "../types/reservation.types";

export type AttributionVerificationLevel =
  | "verified"
  | "declared"
  | "referrer"
  | "none";

export type AttributionVerification = {
  level: AttributionVerificationLevel;
  label: string;
  detail: string;
};

export type AttributionParam = {
  key: string;
  value: string;
};

export type AttributionEvidence = {
  params: AttributionParam[];
  landingPage: string | null;
  referrer: string | null;
  trackedUrl: string | null;
  isReconstructed: boolean;
  verification: AttributionVerification;
  hasTracking: boolean;
};

function pickField(
  reservation: ApiReservation,
  key:
    | "utmSource"
    | "utmMedium"
    | "utmCampaign"
    | "utmContent"
    | "utmTerm"
    | "fbclid"
    | "ttclid"
    | "gclid"
    | "landingPage"
    | "referrer"
): string | null {
  const direct = reservation[key];
  const nested = reservation.attribution?.[key];
  const value = direct ?? nested ?? null;
  const trimmed = typeof value === "string" ? value.trim() : "";

  return trimmed !== "" ? trimmed : null;
}

// Determina qué tan confiable es el origen mostrado, de mayor a menor:
//   1) Click ID (gclid/fbclid/ttclid): lo agrega la plataforma, no se puede
//      inventar desde un link manual → origen verificado.
//   2) utm_source: etiquetado manual del link de campaña → declarado.
//   3) referrer: la página desde la que llegó el navegador → estimado.
//   4) Nada: entró directo o sin parámetros de rastreo.
function resolveVerification({
  gclid,
  fbclid,
  ttclid,
  utmSource,
  referrer,
}: {
  gclid: string | null;
  fbclid: string | null;
  ttclid: string | null;
  utmSource: string | null;
  referrer: string | null;
}): AttributionVerification {
  if (gclid) {
    return {
      level: "verified",
      label: "Verificado por Google Ads",
      detail:
        "El link trae un gclid, un identificador que únicamente Google Ads agrega al momento del clic. Es evidencia verídica de que el cliente llegó desde un anuncio de Google.",
    };
  }

  if (fbclid) {
    return {
      level: "verified",
      label: "Verificado por Facebook / Meta",
      detail:
        "El link trae un fbclid, un identificador que únicamente Facebook/Instagram agrega al momento del clic. Es evidencia verídica de que el cliente llegó desde Meta.",
    };
  }

  if (ttclid) {
    return {
      level: "verified",
      label: "Verificado por TikTok",
      detail:
        "El link trae un ttclid, un identificador que únicamente TikTok agrega al momento del clic. Es evidencia verídica de que el cliente llegó desde TikTok.",
    };
  }

  if (utmSource) {
    return {
      level: "declared",
      label: "Declarado por UTM",
      detail: `El link traía utm_source=${utmSource}. Los UTM se escriben manualmente al armar el link de campaña, así que indican el origen declarado (no lo verifica la plataforma).`,
    };
  }

  if (referrer) {
    return {
      level: "referrer",
      label: "Estimado por referrer",
      detail:
        "No hubo parámetros de rastreo en el link; el origen se estimó a partir de la página desde la que llegó el navegador (referrer).",
    };
  }

  return {
    level: "none",
    label: "Sin rastreo (directo)",
    detail:
      "El cliente llegó sin parámetros de rastreo ni referrer: escribió la URL, usó un marcador o abrió un link sin etiquetas de campaña.",
  };
}

export function getAttributionEvidence(
  reservation: ApiReservation,
  siteBaseUrl?: string
): AttributionEvidence {
  const utmSource = pickField(reservation, "utmSource");
  const utmMedium = pickField(reservation, "utmMedium");
  const utmCampaign = pickField(reservation, "utmCampaign");
  const utmContent = pickField(reservation, "utmContent");
  const utmTerm = pickField(reservation, "utmTerm");
  const gclid = pickField(reservation, "gclid");
  const fbclid = pickField(reservation, "fbclid");
  const ttclid = pickField(reservation, "ttclid");
  const landingPage = pickField(reservation, "landingPage");
  const referrer = pickField(reservation, "referrer");

  const params: AttributionParam[] = [
    { key: "utm_source", value: utmSource },
    { key: "utm_medium", value: utmMedium },
    { key: "utm_campaign", value: utmCampaign },
    { key: "utm_content", value: utmContent },
    { key: "utm_term", value: utmTerm },
    { key: "gclid", value: gclid },
    { key: "fbclid", value: fbclid },
    { key: "ttclid", value: ttclid },
  ].filter((param): param is AttributionParam => Boolean(param.value));

  // URL real de aterrizaje si se guardó; si no, se reconstruye el link
  // con los parámetros que sí quedaron registrados en la reservación.
  let trackedUrl: string | null = landingPage;
  let isReconstructed = false;

  if (!trackedUrl && params.length > 0) {
    const query = new URLSearchParams();

    for (const param of params) {
      query.set(param.key, param.value);
    }

    const base = (siteBaseUrl || "").replace(/\/+$/, "");
    trackedUrl = `${base}/?${query.toString()}`;
    isReconstructed = true;
  }

  const verification = resolveVerification({
    gclid,
    fbclid,
    ttclid,
    utmSource,
    referrer,
  });

  return {
    params,
    landingPage,
    referrer,
    trackedUrl,
    isReconstructed,
    verification,
    hasTracking: params.length > 0 || Boolean(landingPage) || Boolean(referrer),
  };
}

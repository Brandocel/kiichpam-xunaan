/**
 * Atribución por agente de reservas.
 *
 * Es una dimensión aparte de la atribución de canal (`attribution.ts`): el
 * canal responde "¿por dónde llegó?" (Google, Facebook, Directo) y el agente
 * responde "¿quién lo cerró?". Un visitante puede llegar por Google usando el
 * link de un hotel: ambas cosas se guardan y no compiten entre sí.
 */

export type AgentAttributionData = {
  code: string;
  capturedAt: string;
  expiresAt: string;
  landingPage?: string;
};

const AGENT_STORAGE_KEY = "kiichpam_sales_agent";

/**
 * Ventana de crédito del agente. Es más larga que la de campañas (30 días)
 * porque un hotel o una agencia entrega el link días antes del viaje.
 */
const AGENT_TTL_DAYS = 60;

/** Alias aceptados en la URL. `ag` es el corto y el que se usa en los links. */
const AGENT_QUERY_KEYS = ["ag", "agente", "agent"] as const;

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

/**
 * Normaliza el código igual que la API (mayúsculas, sin acentos, con guiones)
 * para que `?ag=maria lopez` y `?ag=MARIA-LOPEZ` resuelvan al mismo agente.
 */
export function normalizeAgentCode(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function readAgentCodeFromUrl(url: URL): string | undefined {
  for (const key of AGENT_QUERY_KEYS) {
    const raw = url.searchParams.get(key);

    if (!raw) continue;

    const normalized = normalizeAgentCode(raw);

    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

export function getStoredAgentAttribution(): AgentAttributionData | null {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem(AGENT_STORAGE_KEY);

    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as AgentAttributionData;

    if (!parsed.code || isExpired(parsed.expiresAt)) {
      window.localStorage.removeItem(AGENT_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredAgentAttribution() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AGENT_STORAGE_KEY);
}

/**
 * Lee el código de agente de la URL actual y lo guarda. Es last-touch: si el
 * visitante llega con un link de otro agente, el nuevo se queda con el crédito.
 * Si la URL no trae código, se conserva el que ya estaba guardado.
 */
export function captureAgentFromCurrentUrl(): AgentAttributionData | null {
  if (typeof window === "undefined") return null;

  const currentUrl = new URL(window.location.href);
  const code = readAgentCodeFromUrl(currentUrl);

  if (!code) {
    return getStoredAgentAttribution();
  }

  const now = new Date();

  const attribution: AgentAttributionData = {
    code,
    capturedAt: now.toISOString(),
    expiresAt: addDays(now, AGENT_TTL_DAYS).toISOString(),
    landingPage: window.location.href,
  };

  try {
    window.localStorage.setItem(
      AGENT_STORAGE_KEY,
      JSON.stringify(attribution)
    );
  } catch {
    // Modo privado o storage lleno: la atribución de este request se pierde,
    // pero la reservación debe poder continuar.
  }

  return attribution;
}

/**
 * Código de agente que debe viajar en el payload de cotización y reservación.
 */
export function getAgentCodeForReservation(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const attribution =
    captureAgentFromCurrentUrl() ?? getStoredAgentAttribution();

  return attribution?.code || undefined;
}

/**
 * Arma el link de venta de un agente. Se usa en el panel para copiarlo o
 * generar el QR.
 */
export function buildAgentBookingLink(
  code: string,
  options: { baseUrl?: string; locale?: string; packageCode?: string } = {}
): string {
  const baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
  const locale = options.locale ?? "es";

  const path = `${baseUrl}/${locale}/reservar`;
  const params = new URLSearchParams({ ag: normalizeAgentCode(code) });

  if (options.packageCode) {
    params.set("paquete", options.packageCode);
  }

  return `${path}?${params.toString()}`;
}

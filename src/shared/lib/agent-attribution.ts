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
 * Cookie con el mismo dato. Es la fuente principal porque la escribe el
 * middleware en el servidor, antes de que corra un solo byte de JavaScript:
 * así el crédito sobrevive aunque el visitante navegue, recargue, llegue por
 * un enlace con preview o tenga el JS a medio cargar. localStorage queda como
 * respaldo para sesiones antiguas que ya lo tenían guardado.
 */
export const AGENT_COOKIE_NAME = "kx_ag";

/**
 * Ventana de crédito del agente. Es más larga que la de campañas (30 días)
 * porque un hotel o una agencia entrega el link días antes del viaje.
 */
export const AGENT_TTL_DAYS = 60;

/** Alias aceptados en la URL. `ag` es el corto y el que se usa en los links. */
export const AGENT_QUERY_KEYS = ["ag", "agente", "agent"] as const;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (!match) return undefined;

  const value = decodeURIComponent(match.slice(name.length + 1));

  return value.trim() || undefined;
}

function writeCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

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

  // 1) Cookie: la escribe el middleware y es la que sobrevive la navegación.
  const cookieCode = normalizeAgentCode(readCookie(AGENT_COOKIE_NAME) ?? "");

  if (cookieCode) {
    return {
      code: cookieCode,
      capturedAt: "",
      expiresAt: "",
    };
  }

  // 2) localStorage: respaldo para visitantes que ya lo traían de antes.
  try {
    const rawValue = window.localStorage.getItem(AGENT_STORAGE_KEY);

    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as AgentAttributionData;

    if (!parsed.code || isExpired(parsed.expiresAt)) {
      window.localStorage.removeItem(AGENT_STORAGE_KEY);
      return null;
    }

    // Se promueve a cookie para que a partir de aquí viaje con el visitante.
    writeCookie(AGENT_COOKIE_NAME, parsed.code, AGENT_TTL_DAYS);

    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredAgentAttribution() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AGENT_STORAGE_KEY);
  document.cookie = `${AGENT_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
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

  // La cookie es la que manda; el middleware normalmente ya la escribió, esto
  // cubre el caso de una navegación de cliente que no pasa por el servidor.
  writeCookie(AGENT_COOKIE_NAME, code, AGENT_TTL_DAYS);

  try {
    window.localStorage.setItem(
      AGENT_STORAGE_KEY,
      JSON.stringify(attribution)
    );
  } catch {
    // Modo privado o storage lleno: la cookie ya quedó escrita, así que la
    // atribución sigue viva aunque no haya localStorage.
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

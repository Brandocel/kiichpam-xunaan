type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type KiichpamApiFetchOptions = {
  method?: HttpMethod;
  body?: unknown;
  protected?: boolean;
  cache?: RequestCache;
  headers?: HeadersInit;
};

const API_BASE_URL = process.env.KIICHPAM_API_URL;
const API_CLIENT_KEY = process.env.KIICHPAM_API_CLIENT_KEY;
const API_CLIENT_SECRET = process.env.KIICHPAM_API_CLIENT_SECRET;

function ensureApiConfig(isProtectedRequest: boolean) {
  if (!API_BASE_URL) {
    throw new Error("KIICHPAM_API_URL no está configurada");
  }

  if (isProtectedRequest && (!API_CLIENT_KEY || !API_CLIENT_SECRET)) {
    throw new Error(
      "Las credenciales KIICHPAM_API_CLIENT_KEY y KIICHPAM_API_CLIENT_SECRET no están configuradas"
    );
  }
}

function buildApiUrl(path: string) {
  const cleanBaseUrl = API_BASE_URL?.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBaseUrl}${cleanPath}`;
}

async function parseJsonSafely(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("La respuesta del servidor no es un JSON válido");
  }
}

function getErrorMessage(result: any, fallback: string) {
  if (typeof result?.message === "string" && result.message.trim()) {
    return result.message;
  }

  if (Array.isArray(result?.message) && result.message.length > 0) {
    return result.message.join(", ");
  }

  if (typeof result?.error === "string" && result.error.trim()) {
    return result.error;
  }

  return fallback;
}

export async function kiichpamApiFetch<T>(
  path: string,
  options: KiichpamApiFetchOptions = {}
): Promise<T> {
  const isProtectedRequest = options.protected === true;

  ensureApiConfig(isProtectedRequest);

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (isProtectedRequest) {
    headers.set("x-api-key", API_CLIENT_KEY as string);
    headers.set("x-api-secret", API_CLIENT_SECRET as string);
  }

  const response = await fetch(buildApiUrl(path), {
    method: options.method ?? "GET",
    headers,
    cache: options.cache ?? "no-store",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, `Error al consumir la API: ${path}`)
    );
  }

  return result as T;
}
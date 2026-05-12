import type {
  AdminReservationListParams,
  ApiReservationsListResponse,
} from "../types/reservation.types";
import type { ReservationLifecycleResponse } from "../types/reservation-lifecycle.types";

function buildQueryString(params: AdminReservationListParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

async function parseJsonSafely(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("La respuesta del servidor no es un JSON válido.");
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

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "No se pudo completar la solicitud.")
    );
  }

  return result as T;
}

export async function getAdminReservations(
  params: AdminReservationListParams
): Promise<ApiReservationsListResponse> {
  const queryString = buildQueryString(params);
  const url = queryString
    ? `/api/admin/reservations?${queryString}`
    : "/api/admin/reservations";

  return requestJson<ApiReservationsListResponse>(url, {
    method: "GET",
  });
}

export async function getAdminReservationByFolio(folio: string) {
  return requestJson(`/api/admin/reservations/${encodeURIComponent(folio)}`, {
    method: "GET",
  });
}

export async function updateAdminReservationContact(
  folio: string,
  payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    country?: string;
    comments?: string;
  }
) {
  return requestJson(
    `/api/admin/reservations/${encodeURIComponent(folio)}/contact`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function confirmAdminReservationPaid(folio: string) {
  return requestJson(
    `/api/admin/reservations/${encodeURIComponent(folio)}/confirm-paid`,
    {
      method: "POST",
    }
  );
}

export async function resendAdminReservationEmail(folio: string) {
  return requestJson(
    `/api/admin/reservations/${encodeURIComponent(folio)}/resend-email`,
    {
      method: "POST",
    }
  );
}

export async function getAdminReservationLifecycle(
  folio: string
): Promise<ReservationLifecycleResponse> {
  return requestJson<ReservationLifecycleResponse>(
    `/api/admin/reservations/${encodeURIComponent(folio)}/lifecycle`,
    {
      method: "GET",
    }
  );
}

export async function getAdminReservationEmailStatus(folio: string) {
  return requestJson(
    `/api/admin/reservations/${encodeURIComponent(folio)}/email-status`,
    {
      method: "GET",
    }
  );
}
import type {
  PaymentIntentRequest,
  PaymentIntentResponse,
  ReservationContactPayload,
  ReservationContactResponse,
  ReservationCreateRequest,
  ReservationCreateResponse,
  ReservationGetResponse,
  ReservationQuoteRequest,
  ReservationQuoteResponse,
} from "../types/booking.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function ensureApiUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL no está configurada");
  }
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

  if (typeof result?.error === "string" && result.error.trim()) {
    return result.error;
  }

  return fallback;
}

export async function getReservationQuote(
  payload: ReservationQuoteRequest
): Promise<ReservationQuoteResponse> {
  ensureApiUrl();

  const response = await fetch(`${API_BASE_URL}/reservations/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(result, "No se pudo obtener la cotización"));
  }

  return result as ReservationQuoteResponse;
}

export async function createReservation(
  payload: ReservationCreateRequest
): Promise<ReservationCreateResponse> {
  ensureApiUrl();

  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(result, "No se pudo crear la reservación"));
  }

  return result as ReservationCreateResponse;
}

export async function getReservationByFolio(
  folio: string
): Promise<ReservationGetResponse> {
  ensureApiUrl();

  const response = await fetch(`${API_BASE_URL}/reservations/${folio}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "No se pudo recuperar la reservación")
    );
  }

  return result as ReservationGetResponse;
}

export async function updateReservationContact(
  folio: string,
  payload: ReservationContactPayload
): Promise<ReservationContactResponse> {
  ensureApiUrl();

  const response = await fetch(
    `${API_BASE_URL}/reservations/${folio}/contact`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    }
  );

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(result, "No se pudo guardar el contacto"));
  }

  return result as ReservationContactResponse;
}

export async function createPaymentIntent(
  payload: PaymentIntentRequest
): Promise<PaymentIntentResponse> {
  ensureApiUrl();

  const response = await fetch(`${API_BASE_URL}/payments/intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(result, "No se pudo iniciar el pago"));
  }

  return result as PaymentIntentResponse;
}

export async function createOxxoReference(
  payload: PaymentIntentRequest
): Promise<PaymentIntentResponse> {
  ensureApiUrl();

  const response = await fetch(`${API_BASE_URL}/payments/oxxo-reference`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "No se pudo generar la referencia OXXO")
    );
  }

  return result as PaymentIntentResponse;
}
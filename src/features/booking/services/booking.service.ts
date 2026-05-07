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

async function bookingFetch<T>(
  path: string,
  options: RequestInit,
  fallbackErrorMessage: string
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(result, fallbackErrorMessage));
  }

  return result as T;
}

export async function getReservationQuote(
  payload: ReservationQuoteRequest
): Promise<ReservationQuoteResponse> {
  return bookingFetch<ReservationQuoteResponse>(
    "/api/booking/quote",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "No se pudo obtener la cotización"
  );
}

export async function createReservation(
  payload: ReservationCreateRequest
): Promise<ReservationCreateResponse> {
  return bookingFetch<ReservationCreateResponse>(
    "/api/booking/reservations",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "No se pudo crear la reservación"
  );
}

export async function getReservationByFolio(
  folio: string
): Promise<ReservationGetResponse> {
  return bookingFetch<ReservationGetResponse>(
    `/api/booking/reservations/${encodeURIComponent(folio)}`,
    {
      method: "GET",
    },
    "No se pudo recuperar la reservación"
  );
}

export async function updateReservationContact(
  folio: string,
  payload: ReservationContactPayload
): Promise<ReservationContactResponse> {
  return bookingFetch<ReservationContactResponse>(
    `/api/booking/reservations/${encodeURIComponent(folio)}/contact`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    "No se pudo guardar el contacto"
  );
}

export async function createPaymentIntent(
  payload: PaymentIntentRequest
): Promise<PaymentIntentResponse> {
  return bookingFetch<PaymentIntentResponse>(
    "/api/booking/payments/intent",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "No se pudo iniciar el pago"
  );
}

export async function createOxxoReference(
  payload: PaymentIntentRequest
): Promise<PaymentIntentResponse> {
  return bookingFetch<PaymentIntentResponse>(
    "/api/booking/payments/oxxo-reference",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "No se pudo generar la referencia OXXO"
  );
}

export async function getPaymentStatusByFolio(
  folio: string
): Promise<PaymentIntentResponse> {
  return bookingFetch<PaymentIntentResponse>(
    `/api/booking/payments/status/${encodeURIComponent(folio)}`,
    {
      method: "GET",
    },
    "No se pudo consultar el estado del pago"
  );
}
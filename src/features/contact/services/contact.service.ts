import type {
  ContactApiPayload,
  ContactApiResponse,
  ContactFormPayload,
} from "../types/contact.types";

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

function buildFullName(payload: ContactFormPayload) {
  if (payload.name?.trim()) {
    return payload.name.trim();
  }

  const firstName = payload.firstName?.trim() ?? "";
  const lastName = payload.lastName?.trim() ?? "";

  return `${firstName} ${lastName}`.trim();
}

function normalizeContactPayload(
  payload: ContactFormPayload
): ContactApiPayload {
  const name = buildFullName(payload);

  if (!name) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!payload.email?.trim()) {
    throw new Error("El correo electrónico es obligatorio.");
  }

  if (!payload.phone?.trim()) {
    throw new Error("El número telefónico es obligatorio.");
  }

  if (!payload.message?.trim()) {
    throw new Error("El mensaje es obligatorio.");
  }

  return {
    name,
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    country: payload.country?.trim() || "No especificado",
    subjectType: payload.subjectType?.trim() || "reservations",
    subject:
      payload.subject?.trim() || "Mensaje desde formulario de contacto",
    message: payload.message.trim(),
    lang: payload.lang?.trim() || "es",
  };
}

export async function sendContactMessage(
  payload: ContactFormPayload
): Promise<ContactApiResponse> {
  const normalizedPayload = normalizeContactPayload(payload);

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(normalizedPayload),
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "No se pudo enviar el mensaje")
    );
  }

  return result as ContactApiResponse;
}
import type {
  ContactApiPayload,
  ContactApiResponse,
  ContactFormPayload,
} from "../types/contact.types";

function isDebugEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_CONTACT_DEBUG === "true"
  );
}

async function parseJsonSafely(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("La respuesta del servidor no es un JSON válido.");
  }
}

function translateBackendValidationMessage(message: string) {
  const normalized = message.toLowerCase().trim();

  const messagesMap: Record<string, string> = {
    "message must be longer than or equal to 10 characters":
      "El mensaje debe tener mínimo 10 caracteres.",
    "name must be longer than or equal to 2 characters":
      "El nombre debe tener mínimo 2 caracteres.",
    "email must be an email": "Ingresa un correo electrónico válido.",
    "phone must be longer than or equal to 7 characters":
      "El teléfono debe tener mínimo 7 caracteres.",
    "subject must be longer than or equal to 3 characters":
      "El asunto debe tener mínimo 3 caracteres.",
    "country must be longer than or equal to 2 characters":
      "El país debe tener mínimo 2 caracteres.",
  };

  return messagesMap[normalized] || message;
}

function getErrorMessage(result: any, fallback: string) {
  if (Array.isArray(result?.errors) && result.errors.length > 0) {
    const validationMessages = result.errors
      .map((error: any) => {
        if (typeof error?.message === "string" && error.message.trim()) {
          return translateBackendValidationMessage(error.message);
        }

        if (Array.isArray(error?.message) && error.message.length > 0) {
          return error.message
            .map((message: string) =>
              translateBackendValidationMessage(message)
            )
            .join(", ");
        }

        return null;
      })
      .filter(Boolean);

    if (validationMessages.length > 0) {
      return validationMessages.join(" ");
    }
  }

  if (Array.isArray(result?.message) && result.message.length > 0) {
    return result.message
      .map((message: string) => translateBackendValidationMessage(message))
      .join(", ");
  }

  if (
    typeof result?.message === "string" &&
    result.message.trim() &&
    result.message.toLowerCase().trim() !== "validation error"
  ) {
    return translateBackendValidationMessage(result.message);
  }

  if (typeof result?.error === "string" && result.error.trim()) {
    return translateBackendValidationMessage(result.error);
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
  const email = payload.email?.trim() ?? "";
  const phone = payload.phone?.trim() || "No especificado";
  const country = payload.country?.trim() || "México";
  const subjectType = payload.subjectType?.trim() || "reservations";
  const subject =
    payload.subject?.trim() || "Quiero información sobre paquetes";
  const message = payload.message?.trim() ?? "";
  const lang = payload.lang?.trim() || "es";

  if (!name) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!email) {
    throw new Error("El correo electrónico es obligatorio.");
  }

  if (!message) {
    throw new Error("El mensaje es obligatorio.");
  }

  return {
    name,
    email,
    phone,
    country,
    subjectType,
    subject,
    message,
    lang,
  };
}

export async function sendContactMessage(
  payload: ContactFormPayload
): Promise<ContactApiResponse> {
  const normalizedPayload = normalizeContactPayload(payload);

  if (isDebugEnabled()) {
    console.log("========== CONTACT_FRONT_START ==========");
    console.log("[CONTACT_FRONT_PAYLOAD]", normalizedPayload);
  }

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(normalizedPayload),
  });

  const result = await parseJsonSafely(response);

  if (isDebugEnabled()) {
    console.log("[CONTACT_FRONT_STATUS]", response.status);
    console.log("[CONTACT_FRONT_OK]", response.ok);
    console.log("[CONTACT_FRONT_RESULT]", result);
    console.log("========== CONTACT_FRONT_END ==========");
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(result, "No se pudo enviar el mensaje."));
  }

  if (result && typeof result === "object" && result.success === false) {
    throw new Error(getErrorMessage(result, "No se pudo enviar el mensaje."));
  }

  return result as ContactApiResponse;
}
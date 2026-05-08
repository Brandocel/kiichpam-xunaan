import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ContactProxyResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

function isDebugEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_CONTACT_DEBUG === "true"
  );
}

function getApiBaseUrl() {
  const baseUrl =
    process.env.KIICHPAM_API_URL ||
    process.env.NEXT_PUBLIC_KIICHPAM_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL;

  if (!baseUrl) {
    throw new Error(
      "Falta configurar KIICHPAM_API_URL en las variables de entorno."
    );
  }

  return baseUrl.replace(/\/+$/, "");
}

async function parseApiResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {
      success: response.ok,
      message: response.ok
        ? "Solicitud procesada correctamente."
        : "El servidor no devolvió respuesta.",
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      message: "La API respondió, pero no devolvió un JSON válido.",
      raw: text,
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiBaseUrl = getApiBaseUrl();
    const apiUrl = `${apiBaseUrl}/contact`;

    if (isDebugEnabled()) {
      console.log("========== CONTACT_PROXY_START ==========");
      console.log("[CONTACT_PROXY_BODY]", body);
      console.log("[CONTACT_PROXY_URL]", apiUrl);
    }

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(body),
    });

    const result = await parseApiResponse(apiResponse);

    if (isDebugEnabled()) {
      console.log("[CONTACT_PROXY_STATUS]", apiResponse.status);
      console.log("[CONTACT_PROXY_OK]", apiResponse.ok);
      console.log("[CONTACT_PROXY_RESULT]", result);
      console.log("========== CONTACT_PROXY_END ==========");
    }

    return NextResponse.json(result, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error("CONTACT_PROXY_ERROR", error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : "No se pudo enviar el mensaje.";

    const response: ContactProxyResponse = {
      success: false,
      message,
    };

    return NextResponse.json(response, {
      status: 400,
    });
  }
}
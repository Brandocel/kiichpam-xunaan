import { NextResponse } from "next/server";

import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await kiichpamApiFetch("/contact", {
      method: "POST",
      body,
      protected: false,
    });

    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error) {
    console.error("CONTACT_PROXY_ERROR", error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : "No se pudo enviar el mensaje.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
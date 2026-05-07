import { NextResponse } from "next/server";

import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await kiichpamApiFetch("/payments/oxxo-reference", {
      method: "POST",
      body,
      protected: false,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo generar la referencia OXXO";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
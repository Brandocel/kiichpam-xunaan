import { NextResponse } from "next/server";

import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await kiichpamApiFetch("/payments/intent", {
      method: "POST",
      body,
      protected: false,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo iniciar el pago";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
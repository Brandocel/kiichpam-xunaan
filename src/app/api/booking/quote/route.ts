import { NextResponse } from "next/server";

import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await kiichpamApiFetch("/reservations/quote", {
      method: "POST",
      body,
      protected: false,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo obtener la cotización";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
import { NextResponse } from "next/server";

import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";

type RouteParams = {
  params: Promise<{
    folio: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { folio } = await params;

    const result = await kiichpamApiFetch(
      `/reservations/${encodeURIComponent(folio)}`,
      {
        method: "GET",
        protected: true,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo recuperar la reservación";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
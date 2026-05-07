import { NextResponse } from "next/server";

import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";

type RouteParams = {
  params: Promise<{
    folio: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { folio } = await params;
    const body = await request.json();

    const result = await kiichpamApiFetch(
      `/reservations/${encodeURIComponent(folio)}/contact`,
      {
        method: "PATCH",
        body,
        protected: true,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo guardar el contacto";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
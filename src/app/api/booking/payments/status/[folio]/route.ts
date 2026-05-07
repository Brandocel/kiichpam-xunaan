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
      `/payments/status/${encodeURIComponent(folio)}`,
      {
        method: "GET",
        protected: false,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo consultar el estado del pago";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
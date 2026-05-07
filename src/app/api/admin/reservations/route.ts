import { NextRequest, NextResponse } from "next/server";

import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";
import { requireAdminSession } from "@/shared/lib/require-admin-session";

export async function GET(request: NextRequest) {
  try {
    const { unauthorizedResponse } = await requireAdminSession(request);

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const queryString = request.nextUrl.searchParams.toString();

    const endpoint = queryString
      ? `/reservations?${queryString}`
      : "/reservations";

    const result = await kiichpamApiFetch(endpoint, {
      method: "GET",
      protected: true,
    });

    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error) {
    console.error("ADMIN_RESERVATIONS_PROXY_ERROR", error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : "No se pudieron obtener las reservaciones.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
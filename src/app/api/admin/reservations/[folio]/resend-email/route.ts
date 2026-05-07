import { NextRequest, NextResponse } from "next/server";
import {
  buildKiichpamApiUrl,
  fetchKiichpamApi,
} from "@/shared/lib/kiichpam-api";
import { requireAdminSession } from "@/shared/lib/require-admin-session";

type RouteContext = {
  params: Promise<{
    folio: string;
  }> | {
    folio: string;
  };
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { unauthorizedResponse } = await requireAdminSession(request);

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const { folio } = await context.params;

    const apiUrl = buildKiichpamApiUrl(
      `/reservations/${encodeURIComponent(folio)}/resend-email`
    );

    const apiResponse = await fetchKiichpamApi(apiUrl, {
      method: "POST",
    });

    return NextResponse.json(apiResponse.data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error("ADMIN_RESERVATION_RESEND_EMAIL_PROXY_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudo reenviar el correo de la reservación.",
      },
      { status: 500 }
    );
  }
}
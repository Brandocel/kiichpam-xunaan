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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { unauthorizedResponse } = await requireAdminSession(request);

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const { folio } = await context.params;

    const apiUrl = buildKiichpamApiUrl(
      `/reservations/${encodeURIComponent(folio)}/email-status`
    );

    const apiResponse = await fetchKiichpamApi(apiUrl, {
      method: "GET",
    });

    return NextResponse.json(apiResponse.data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error("ADMIN_RESERVATION_EMAIL_STATUS_PROXY_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudo consultar el estado de correos.",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";
import { requireAdminSession } from "@/shared/lib/require-admin-session";

type RouteContext = {
  params:
    | Promise<{
        folio: string;
      }>
    | {
        folio: string;
      };
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { unauthorizedResponse } = await requireAdminSession(request);

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const { folio } = await context.params;
    const body = await request.json();

    const result = await kiichpamApiFetch(
      `/reservations/${encodeURIComponent(folio)}/contact`,
      {
        method: "PATCH",
        body,
        protected: true,
      }
    );

    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error) {
    console.error("ADMIN_RESERVATION_CONTACT_PROXY_ERROR", error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : "No se pudieron actualizar los datos de contacto.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

import { ADMIN_PERMISSIONS } from "@/shared/lib/admin-auth";
import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";
import { requirePermission } from "@/shared/lib/require-admin-session";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requirePermission(
    request,
    ADMIN_PERMISSIONS.AGENTS_VIEW
  );

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const params = new URLSearchParams();

    for (const key of ["from", "to", "agentCode"]) {
      const value = request.nextUrl.searchParams.get(key);

      if (value) {
        params.set(key, value);
      }
    }

    const query = params.toString();

    const result = await kiichpamApiFetch(
      `/sales-agents/performance${query ? `?${query}` : ""}`,
      {
        method: "GET",
        protected: true,
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("ADMIN_AGENTS_PERFORMANCE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "No se pudo obtener el desempeño de los agentes.",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { ADMIN_PERMISSIONS } from "@/shared/lib/admin-auth";
import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";
import { requirePermission } from "@/shared/lib/require-admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requirePermission(
    request,
    ADMIN_PERMISSIONS.AGENTS_UPDATE
  );

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const { id } = await params;

    const result = await kiichpamApiFetch(
      `/sales-agents/${id}/regenerate-link`,
      {
        method: "POST",
        protected: true,
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("ADMIN_AGENTS_REGENERATE_LINK_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "No se pudo generar un link nuevo.",
      },
      { status: 400 }
    );
  }
}

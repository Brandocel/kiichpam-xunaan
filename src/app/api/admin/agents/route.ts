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
    const result = await kiichpamApiFetch("/sales-agents", {
      method: "GET",
      protected: true,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("ADMIN_AGENTS_LIST_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "No se pudieron obtener los agentes.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse } = await requirePermission(
    request,
    ADMIN_PERMISSIONS.AGENTS_CREATE
  );

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();

    const result = await kiichpamApiFetch("/sales-agents", {
      method: "POST",
      protected: true,
      body,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("ADMIN_AGENTS_CREATE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "No se pudo crear el agente.",
      },
      { status: 400 }
    );
  }
}

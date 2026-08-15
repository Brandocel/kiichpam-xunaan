import { NextRequest, NextResponse } from "next/server";

import { ADMIN_PERMISSIONS } from "@/shared/lib/admin-auth";
import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";
import { requirePermission } from "@/shared/lib/require-admin-session";

/**
 * Catálogo de paquetes para el formulario de alta.
 * El agente solo puede elegir de aquí: los precios salen del catálogo, no de
 * un campo libre.
 */
export async function GET(request: NextRequest) {
  const { errorResponse } = await requirePermission(
    request,
    ADMIN_PERMISSIONS.RESERVATIONS_CREATE
  );

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const result = await kiichpamApiFetch("/packages?lang=es", {
      method: "GET",
      protected: true,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("ADMIN_PACKAGES_LIST_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "No se pudieron obtener los paquetes.",
      },
      { status: 500 }
    );
  }
}

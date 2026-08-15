import { NextRequest, NextResponse } from "next/server";

import { ADMIN_PERMISSIONS } from "@/shared/lib/admin-auth";
import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";
import { requirePermission } from "@/shared/lib/require-admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ folio: string }> }
) {
  // Generar un cobro es una acción de dinero: se pide el mismo permiso que
  // cambiar el estado de una reservación, no solo el de verla.
  const { errorResponse } = await requirePermission(
    request,
    ADMIN_PERMISSIONS.RESERVATIONS_CHANGE_STATUS
  );

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const { folio } = await params;
    const body = await request.json();

    const result = await kiichpamApiFetch("/payments/deposit-link", {
      method: "POST",
      protected: true,
      body: {
        folio,
        amountMXN: Number(body?.amountMXN),
      },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("ADMIN_DEPOSIT_LINK_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "No se pudo generar el link de cobro.",
      },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { ADMIN_PERMISSIONS } from "@/shared/lib/admin-auth";
import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";
import { requirePermission } from "@/shared/lib/require-admin-session";

/**
 * Alta de reservación desde el panel.
 *
 * La atribución al agente NO se toma del cuerpo del request: sale del código
 * firmado en la sesión. Así un agente no puede registrar una venta a nombre
 * de otro editando el payload. El personal interno (sin agente en su sesión)
 * sí puede elegirlo explícitamente.
 */
export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requirePermission(
    request,
    ADMIN_PERMISSIONS.RESERVATIONS_CREATE
  );

  if (errorResponse || !session) {
    return errorResponse;
  }

  try {
    const body = await request.json();

    const agentCode = session.agentCode
      ? session.agentCode
      : typeof body?.agentCode === "string" && body.agentCode.trim()
        ? body.agentCode.trim()
        : undefined;

    const result = await kiichpamApiFetch("/reservations", {
      method: "POST",
      protected: true,
      body: {
        packageCode: body?.packageCode,
        visitDate: body?.visitDate,
        adults: Number(body?.adults) || 0,
        children: Number(body?.children) || 0,
        infants: Number(body?.infants) || 0,
        inapamVisitors: Number(body?.inapamVisitors) || 0,
        couponCode: body?.couponCode || undefined,
        campaignCode: body?.campaignCode || undefined,
        lang: "es",

        firstName: body?.firstName,
        lastName: body?.lastName,
        email: body?.email,
        phone: body?.phone,
        country: body?.country,
        comments: body?.comments || undefined,

        agentCode,

        // Origen de la venta: la capturó una persona, no el sitio web.
        reference: body?.reference || "Directo",
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("ADMIN_RESERVATION_CREATE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "No se pudo crear la reservación.",
      },
      { status: 400 }
    );
  }
}

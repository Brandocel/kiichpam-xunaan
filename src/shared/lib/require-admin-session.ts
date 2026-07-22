import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminSessionSecret,
  verifyAdminSession,
} from "@/shared/lib/admin-auth";

export async function requireAdminSession(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  const session = await verifyAdminSession(token, getAdminSessionSecret());

  if (!session) {
    return {
      session: null,
      unauthorizedResponse: NextResponse.json(
        {
          success: false,
          message: "No autorizado.",
        },
        { status: 401 }
      ),
    };
  }

  return {
    session,
    unauthorizedResponse: null,
  };
}

/**
 * Igual que requireAdminSession, pero además exige que la sesión tenga un
 * permiso específico. Devuelve 401 si no hay sesión y 403 si falta el permiso.
 */
export async function requirePermission(
  request: NextRequest,
  permission: string
) {
  const { session, unauthorizedResponse } = await requireAdminSession(request);

  if (unauthorizedResponse || !session) {
    return {
      session: null,
      errorResponse:
        unauthorizedResponse ??
        NextResponse.json(
          { success: false, message: "No autorizado." },
          { status: 401 }
        ),
    };
  }

  if (!session.permissions?.includes(permission)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, message: "No tienes permiso para esta acción." },
        { status: 403 }
      ),
    };
  }

  return {
    session,
    errorResponse: null,
  };
}
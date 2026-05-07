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
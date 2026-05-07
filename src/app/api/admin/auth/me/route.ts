import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminSessionSecret,
  verifyAdminSession,
} from "@/shared/lib/admin-auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  const session = await verifyAdminSession(token, getAdminSessionSecret());

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Sesión no válida.",
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      email: session.email,
      name: session.name,
      role: session.role,
      permissions: session.permissions,
    },
  });
}
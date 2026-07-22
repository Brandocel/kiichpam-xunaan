import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  AdminRole,
  createAdminSessionToken,
  getAdminSessionSecret,
  getPermissionsForRole,
  isAdminRole,
} from "@/shared/lib/admin-auth";
import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";

type ValidateCredentialsResponse = {
  data?: {
    valid: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      isActive: boolean;
    } | null;
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Correo y contraseña son obligatorios.",
        },
        { status: 400 }
      );
    }

    let result: ValidateCredentialsResponse;

    try {
      result = await kiichpamApiFetch<ValidateCredentialsResponse>(
        "/admin-users/validate-credentials",
        {
          method: "POST",
          protected: true,
          body: { email, password },
        }
      );
    } catch (error) {
      console.error("ADMIN_LOGIN_API_ERROR", error);

      return NextResponse.json(
        {
          success: false,
          message: "No se pudo validar el acceso. Intenta más tarde.",
        },
        { status: 502 }
      );
    }

    const payload = result?.data;

    if (!payload?.valid || !payload.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Correo o contraseña incorrectos.",
        },
        { status: 401 }
      );
    }

    const user = payload.user;
    const role: AdminRole = isAdminRole(user.role)
      ? user.role
      : ("VIEWER" as AdminRole);

    const expiresInSeconds = 60 * 60 * 8;

    const token = await createAdminSessionToken(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role,
        permissions: getPermissionsForRole(role),
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
      },
      getAdminSessionSecret()
    );

    const response = NextResponse.json({
      success: true,
      message: "Sesión iniciada correctamente.",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: expiresInSeconds,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "No se pudo iniciar sesión.",
      },
      { status: 500 }
    );
  }
}

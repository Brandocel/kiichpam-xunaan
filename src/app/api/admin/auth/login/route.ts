import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionSecret,
  SUPER_ADMIN_PERMISSIONS,
} from "@/shared/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || "");

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Faltan variables ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env.",
        },
        { status: 500 }
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Correo o contraseña incorrectos.",
        },
        { status: 401 }
      );
    }

    const expiresInSeconds = 60 * 60 * 8;

    const token = await createAdminSessionToken(
      {
        sub: "admin-001",
        email: adminEmail,
        name: "Administrador",
        role: "SUPER_ADMIN",
        permissions: SUPER_ADMIN_PERMISSIONS,
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
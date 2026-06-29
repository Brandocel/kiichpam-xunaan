import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminSessionSecret,
  verifyAdminSession,
} from "@/shared/lib/admin-auth";

// Prefijos de rutas válidas que el middleware no debe bloquear
const VALID_PREFIXES = ["/es", "/en", "/admin", "/_next", "/api"];

// Rutas exactas que siempre deben pasar
const VALID_EXACT = ["/sitemap.xml", "/robots.txt", "/favicon.ico", "/"];

// Extensiones de archivos estáticos que siempre deben pasar
const STATIC_EXT = /\.(?:js|css|map|json|webp|avif|jpg|jpeg|png|gif|svg|ico|woff2?|ttf|otf|mp4|webm|pdf)$/i;

function isGhostWordPressPath(pathname: string): boolean {
  if (VALID_EXACT.includes(pathname)) return false;
  if (STATIC_EXT.test(pathname)) return false;
  if (VALID_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return false;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Devolver 410 Gone para rutas viejas de WordPress que no deben existir
  if (isGhostWordPressPath(pathname)) {
    return new NextResponse(null, { status: 410 });
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginRoute = pathname === "/admin/login";

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await verifyAdminSession(token, getAdminSessionSecret());

  if (isAdminLoginRoute && session) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (!isAdminLoginRoute && !session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Excluir /_next/static y /_next/image del middleware para no añadir latencia innecesaria
  matcher: ["/((?!_next/static|_next/image).*)"],
};
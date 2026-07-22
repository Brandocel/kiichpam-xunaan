import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  AdminSessionPayload,
  getAdminSessionSecret,
  verifyAdminSession,
} from "@/shared/lib/admin-auth";

/**
 * Permiso requerido para cada sección del panel. El orden define también la
 * prioridad al elegir la primera ruta permitida (landing) para el usuario.
 */
const ADMIN_ROUTE_PERMISSIONS: { prefix: string; permission: string }[] = [
  { prefix: "/admin/dashboard", permission: "dashboard.view" },
  { prefix: "/admin/reservaciones", permission: "reservations.view" },
  { prefix: "/admin/usuarios", permission: "users.view" },
  { prefix: "/admin/roles", permission: "roles.view" },
  { prefix: "/admin/pagos", permission: "payments.view" },
  { prefix: "/admin/reportes", permission: "reports.view" },
];

function getRequiredPermission(pathname: string): string | null {
  const match = ADMIN_ROUTE_PERMISSIONS.find((route) =>
    pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)
  );

  return match?.permission ?? null;
}

function getLandingRoute(session: AdminSessionPayload): string | null {
  const allowed = ADMIN_ROUTE_PERMISSIONS.find((route) =>
    session.permissions?.includes(route.permission)
  );

  return allowed?.prefix ?? null;
}

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
    const landing = getLandingRoute(session) ?? "/admin/dashboard";

    return NextResponse.redirect(new URL(landing, request.url));
  }

  if (!isAdminLoginRoute && !session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Sesión válida: verificar permiso de la sección solicitada.
  if (!isAdminLoginRoute && session) {
    const requiredPermission = getRequiredPermission(pathname);

    if (
      requiredPermission &&
      !session.permissions?.includes(requiredPermission)
    ) {
      const landing = getLandingRoute(session);

      // Si no tiene acceso a ninguna sección, cerrar hacia el login.
      if (!landing) {
        const loginUrl = new URL("/admin/login", request.url);

        return NextResponse.redirect(loginUrl);
      }

      // Evitar bucle de redirección si ya está en su landing.
      if (!pathname.startsWith(landing)) {
        return NextResponse.redirect(new URL(landing, request.url));
      }
    }
  }

  // Las rutas del panel son autenticadas y dinámicas: nunca deben cachearse
  // en el CDN/edge. Esto evita que se sirva la variante RSC como documento.
  const response = NextResponse.next();

  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate"
  );

  return response;
}

export const config = {
  // Excluir /_next/static y /_next/image del middleware para no añadir latencia innecesaria
  matcher: ["/((?!_next/static|_next/image).*)"],
};
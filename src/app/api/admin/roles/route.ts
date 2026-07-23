import { NextRequest, NextResponse } from "next/server";

import { ADMIN_PERMISSIONS, ADMIN_ROLES } from "@/shared/lib/admin-auth";
import { ADMIN_PERMISSION_GROUPS } from "@/shared/lib/admin-permissions";
import {
  getDefaultRolePermissions,
  getRolePermissionsState,
  saveRolePermissions,
} from "@/shared/lib/role-permissions-store";
import { requirePermission } from "@/shared/lib/require-admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requirePermission(
    request,
    ADMIN_PERMISSIONS.ROLES_VIEW
  );

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const state = await getRolePermissionsState();

    return NextResponse.json(
      {
        success: true,
        data: {
          roles: ADMIN_ROLES,
          groups: ADMIN_PERMISSION_GROUPS,
          permissions: state.permissions,
          defaults: getDefaultRolePermissions(),
          updatedAt: state.updatedAt,
          updatedBy: state.updatedBy,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN_ROLES_GET_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudieron cargar los permisos de los roles.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { session, errorResponse } = await requirePermission(
    request,
    ADMIN_PERMISSIONS.ROLES_UPDATE
  );

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();

    if (!body?.permissions || typeof body.permissions !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "El cuerpo debe incluir un objeto permissions.",
        },
        { status: 400 }
      );
    }

    const state = await saveRolePermissions({
      permissions: body.permissions,
      updatedBy: session?.email ?? null,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Permisos actualizados. Los usuarios con sesión abierta los verán al volver a iniciar sesión.",
        data: {
          permissions: state.permissions,
          updatedAt: state.updatedAt,
          updatedBy: state.updatedBy,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN_ROLES_UPDATE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "No se pudieron guardar los permisos.",
      },
      { status: 400 }
    );
  }
}

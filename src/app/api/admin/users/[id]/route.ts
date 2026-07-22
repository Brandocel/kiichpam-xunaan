import { NextRequest, NextResponse } from "next/server";

import { ADMIN_PERMISSIONS } from "@/shared/lib/admin-auth";
import { kiichpamApiFetch } from "@/shared/lib/kiichpam-api";
import { requirePermission } from "@/shared/lib/require-admin-session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requirePermission(
    request,
    ADMIN_PERMISSIONS.USERS_UPDATE
  );

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const result = await kiichpamApiFetch(`/admin-users/${id}`, {
      method: "PATCH",
      protected: true,
      body,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("ADMIN_USERS_UPDATE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "No se pudo actualizar el usuario.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requirePermission(
    request,
    ADMIN_PERMISSIONS.USERS_DISABLE
  );

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const { id } = await params;

    const result = await kiichpamApiFetch(`/admin-users/${id}`, {
      method: "DELETE",
      protected: true,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("ADMIN_USERS_DELETE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "No se pudo eliminar el usuario.",
      },
      { status: 400 }
    );
  }
}

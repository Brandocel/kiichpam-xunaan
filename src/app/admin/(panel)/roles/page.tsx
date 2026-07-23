import { cookies } from "next/headers";

import RolesPermissionsManager from "@/features/admin/roles/components/RolesPermissionsManager";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_PERMISSIONS,
  getAdminSessionSecret,
  verifyAdminSession,
} from "@/shared/lib/admin-auth";

export const metadata = {
  title: "Roles | Admin Kiichpam Xunáan",
};

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  const session = await verifyAdminSession(token, getAdminSessionSecret());

  const canEdit = Boolean(
    session?.permissions?.includes(ADMIN_PERMISSIONS.ROLES_UPDATE)
  );

  return <RolesPermissionsManager canEdit={canEdit} />;
}

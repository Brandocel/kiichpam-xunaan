import { ADMIN_PERMISSIONS } from "./admin-auth";

const P = ADMIN_PERMISSIONS;

export type AdminPermissionKind = "view" | "action";

export type AdminPermissionMeta = {
  key: string;
  label: string;
  description: string;
  kind: AdminPermissionKind;
  /**
   * Ruta del panel que este permiso desbloquea.
   * Solo aplica a los permisos de vista (los que revisa el middleware).
   */
  route?: string;
};

export type AdminPermissionGroup = {
  key: string;
  label: string;
  description: string;
  permissions: AdminPermissionMeta[];
};

/**
 * Catálogo completo de permisos del panel, agrupado por módulo.
 *
 * Los permisos con kind "view" son los que el middleware usa para dejar entrar
 * (o no) a cada sección: si se los quitas a un rol, la sección desaparece del
 * menú y la ruta queda bloqueada.
 */
export const ADMIN_PERMISSION_GROUPS: AdminPermissionGroup[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Resumen general del panel.",
    permissions: [
      {
        key: P.DASHBOARD_VIEW,
        label: "Ver dashboard",
        description: "Entra a la sección Dashboard y ve los indicadores.",
        kind: "view",
        route: "/admin/dashboard",
      },
    ],
  },
  {
    key: "reservations",
    label: "Reservaciones",
    description: "Gestión de reservaciones de clientes.",
    permissions: [
      {
        key: P.RESERVATIONS_VIEW,
        label: "Ver reservaciones",
        description: "Entra a Reservaciones y consulta la lista y el detalle.",
        kind: "view",
        route: "/admin/reservaciones",
      },
      {
        key: P.RESERVATIONS_CREATE,
        label: "Crear reservaciones",
        description: "Da de alta reservaciones desde el panel.",
        kind: "action",
      },
      {
        key: P.RESERVATIONS_UPDATE,
        label: "Editar reservaciones",
        description: "Modifica datos de contacto y del viaje.",
        kind: "action",
      },
      {
        key: P.RESERVATIONS_CANCEL,
        label: "Cancelar reservaciones",
        description: "Cancela una reservación existente.",
        kind: "action",
      },
      {
        key: P.RESERVATIONS_CHANGE_STATUS,
        label: "Cambiar estado",
        description: "Marca como pagada, completada, no show, etc.",
        kind: "action",
      },
      {
        key: P.RESERVATIONS_EXPORT,
        label: "Exportar reservaciones",
        description: "Descarga la lista en Excel, CSV o PDF.",
        kind: "action",
      },
    ],
  },
  {
    key: "users",
    label: "Usuarios",
    description: "Cuentas que entran al panel administrativo.",
    permissions: [
      {
        key: P.USERS_VIEW,
        label: "Ver usuarios",
        description: "Entra a Usuarios y consulta las cuentas del panel.",
        kind: "view",
        route: "/admin/usuarios",
      },
      {
        key: P.USERS_CREATE,
        label: "Crear usuarios",
        description: "Da de alta nuevas cuentas administrativas.",
        kind: "action",
      },
      {
        key: P.USERS_UPDATE,
        label: "Editar usuarios",
        description: "Cambia nombre, correo, contraseña y rol.",
        kind: "action",
      },
      {
        key: P.USERS_DISABLE,
        label: "Desactivar usuarios",
        description: "Bloquea el acceso de una cuenta al panel.",
        kind: "action",
      },
    ],
  },
  {
    key: "roles",
    label: "Roles",
    description: "Definición de qué puede hacer cada rol.",
    permissions: [
      {
        key: P.ROLES_VIEW,
        label: "Ver roles",
        description: "Entra a Roles y consulta la matriz de permisos.",
        kind: "view",
        route: "/admin/roles",
      },
      {
        key: P.ROLES_CREATE,
        label: "Crear roles",
        description: "Reservado para roles personalizados a futuro.",
        kind: "action",
      },
      {
        key: P.ROLES_UPDATE,
        label: "Editar permisos de roles",
        description: "Guarda cambios en esta misma matriz de permisos.",
        kind: "action",
      },
    ],
  },
  {
    key: "payments",
    label: "Pagos",
    description: "Cobros, referencias y reembolsos.",
    permissions: [
      {
        key: P.PAYMENTS_VIEW,
        label: "Ver pagos",
        description: "Entra a Pagos y consulta los cobros registrados.",
        kind: "view",
        route: "/admin/pagos",
      },
      {
        key: P.PAYMENTS_REFUND,
        label: "Reembolsar pagos",
        description: "Devuelve dinero de un pago confirmado.",
        kind: "action",
      },
      {
        key: P.PAYMENTS_EXPORT,
        label: "Exportar pagos",
        description: "Descarga el listado de pagos.",
        kind: "action",
      },
    ],
  },
  {
    key: "reports",
    label: "Reportes",
    description: "Exportaciones y análisis administrativo.",
    permissions: [
      {
        key: P.REPORTS_VIEW,
        label: "Ver reportes",
        description: "Entra a Reportes y genera reportes por rango.",
        kind: "view",
        route: "/admin/reportes",
      },
      {
        key: P.REPORTS_EXPORT,
        label: "Exportar reportes",
        description: "Descarga los reportes en Excel, CSV o PDF.",
        kind: "action",
      },
    ],
  },
];

export const ALL_ADMIN_PERMISSIONS: AdminPermissionMeta[] =
  ADMIN_PERMISSION_GROUPS.flatMap((group) => group.permissions);

const PERMISSION_BY_KEY = new Map(
  ALL_ADMIN_PERMISSIONS.map((permission) => [permission.key, permission])
);

export function getPermissionMeta(key: string): AdminPermissionMeta | null {
  return PERMISSION_BY_KEY.get(key) ?? null;
}

export function getPermissionLabel(key: string): string {
  return PERMISSION_BY_KEY.get(key)?.label ?? key;
}

export function isKnownPermission(key: string): boolean {
  return PERMISSION_BY_KEY.has(key);
}

/**
 * Permisos que abren una sección del panel. Útil para explicar en la UI qué
 * secciones verá el rol con la selección actual.
 */
export const VIEW_PERMISSIONS = ALL_ADMIN_PERMISSIONS.filter(
  (permission) => permission.kind === "view"
);

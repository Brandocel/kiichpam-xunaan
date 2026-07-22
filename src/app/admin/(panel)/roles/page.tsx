import { ADMIN_ROLES, ROLE_PERMISSIONS } from "@/shared/lib/admin-auth";

export const metadata = {
  title: "Roles | Admin Kiichpam Xunáan",
};

/**
 * Etiquetas legibles para cada permiso del sistema.
 */
const PERMISSION_LABELS: Record<string, string> = {
  "dashboard.view": "Ver dashboard",
  "reservations.view": "Ver reservaciones",
  "reservations.create": "Crear reservaciones",
  "reservations.update": "Editar reservaciones",
  "reservations.cancel": "Cancelar reservaciones",
  "reservations.change_status": "Cambiar estado de reservaciones",
  "reservations.export": "Exportar reservaciones",
  "users.view": "Ver usuarios",
  "users.create": "Crear usuarios",
  "users.update": "Editar usuarios",
  "users.disable": "Desactivar usuarios",
  "roles.view": "Ver roles",
  "roles.create": "Crear roles",
  "roles.update": "Editar roles",
  "payments.view": "Ver pagos",
  "payments.refund": "Reembolsar pagos",
  "payments.export": "Exportar pagos",
  "reports.view": "Ver reportes",
  "reports.export": "Exportar reportes",
};

function permissionLabel(permission: string): string {
  return PERMISSION_LABELS[permission] ?? permission;
}

export default function AdminRolesPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Seguridad
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Roles</h1>
        <p className="mt-2 text-sm text-slate-500">
          Cada rol define qué puede hacer un usuario en el panel. Asigna un rol
          desde la sección Usuarios.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ADMIN_ROLES.map((role) => {
          const permissions = ROLE_PERMISSIONS[role.role] ?? [];

          return (
            <div
              key={role.role}
              className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-950">
                  {role.label}
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {permissions.length} permiso
                  {permissions.length === 1 ? "" : "s"}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">{role.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    {permissionLabel(permission)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

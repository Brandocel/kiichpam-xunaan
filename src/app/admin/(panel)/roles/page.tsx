export const metadata = {
    title: "Roles | Admin Kiichpam Xunáan",
  };
  
  const demoRoles = [
    {
      name: "SUPER_ADMIN",
      description: "Acceso completo al sistema.",
      permissions: 20,
    },
    {
      name: "SALES",
      description: "Puede gestionar reservaciones y clientes.",
      permissions: 6,
    },
    {
      name: "ACCOUNTING",
      description: "Puede ver pagos, reportes y exportaciones.",
      permissions: 5,
    },
    {
      name: "VIEWER",
      description: "Solo lectura.",
      permissions: 2,
    },
  ];
  
  export default function AdminRolesPage() {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Seguridad
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Roles</h1>
          <p className="mt-2 text-sm text-slate-500">
            Define roles y permisos para controlar qué puede hacer cada usuario.
          </p>
        </div>
  
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {demoRoles.map((role) => (
            <div
              key={role.name}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-950">{role.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{role.description}</p>
  
              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Permisos
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950">
                  {role.permissions}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
export const metadata = {
    title: "Usuarios | Admin Kiichpam Xunáan",
  };
  
  const demoUsers = [
    {
      name: "Administrador",
      email: "admin@kiichpam.com",
      role: "SUPER_ADMIN",
      status: "Activo",
    },
    {
      name: "Ventas",
      email: "ventas@kiichpam.com",
      role: "SALES",
      status: "Activo",
    },
    {
      name: "Contabilidad",
      email: "contabilidad@kiichpam.com",
      role: "ACCOUNTING",
      status: "Activo",
    },
  ];
  
  export default function AdminUsersPage() {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Seguridad
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Usuarios</h1>
          <p className="mt-2 text-sm text-slate-500">
            Aquí podrás administrar usuarios internos del panel administrativo.
          </p>
        </div>
  
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-end">
            <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">
              Nuevo usuario
            </button>
          </div>
  
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                    Nombre
                  </th>
                  <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                    Correo
                  </th>
                  <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                    Rol
                  </th>
                  <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                    Estado
                  </th>
                </tr>
              </thead>
  
              <tbody className="divide-y divide-slate-100">
                {demoUsers.map((user) => (
                  <tr key={user.email}>
                    <td className="py-4 text-sm font-bold text-slate-900">
                      {user.name}
                    </td>
                    <td className="py-4 text-sm text-slate-600">
                      {user.email}
                    </td>
                    <td className="py-4 text-sm font-semibold text-slate-700">
                      {user.role}
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }
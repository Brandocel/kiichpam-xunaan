export const metadata = {
    title: "Reportes | Admin Kiichpam Xunáan",
  };
  
  const reports = [
    {
      title: "Reporte de reservaciones",
      description: "Reservaciones por fecha, estado, paquete y origen.",
    },
    {
      title: "Reporte de ventas",
      description: "Ingresos, descuentos, pagos confirmados y pendientes.",
    },
    {
      title: "Reporte de clientes",
      description: "Clientes, visitas, datos de contacto y comportamiento.",
    },
    {
      title: "Reporte operativo",
      description: "Llegadas, no shows, cancelaciones y reservaciones completadas.",
    },
  ];
  
  export default function AdminReportsPage() {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Análisis
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Reportes</h1>
          <p className="mt-2 text-sm text-slate-500">
            Prepara reportes administrativos y exportaciones para Excel, CSV o PDF.
          </p>
        </div>
  
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {reports.map((report) => (
            <div
              key={report.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-950">
                {report.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {report.description}
              </p>
  
              <button className="mt-6 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                Preparar exportación
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  }
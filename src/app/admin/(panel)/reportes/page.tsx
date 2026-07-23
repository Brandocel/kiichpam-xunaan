import ReservationsReportView from "@/features/admin/reports/components/ReservationsReportView";

export const metadata = {
  title: "Reportes | Admin Kiichpam Xunáan",
};

const upcomingReports = [
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
    <div className="space-y-5">
      <ReservationsReportView />

      <div className="border border-slate-300 bg-white">
        <div className="border-b border-slate-300 bg-slate-100 px-4 py-4">
          <h2 className="text-lg font-black text-slate-950">Otros reportes</h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Próximas exportaciones administrativas del panel.
          </p>
        </div>

        <div className="grid gap-px bg-slate-300 md:grid-cols-3">
          {upcomingReports.map((report) => (
            <div key={report.title} className="bg-white px-4 py-5">
              <h3 className="text-base font-black text-slate-950">
                {report.title}
              </h3>

              <p className="mt-2 text-sm font-medium text-slate-500">
                {report.description}
              </p>

              <span className="mt-4 inline-flex border border-slate-300 bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500">
                Próximamente
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import DashboardStats from "@/features/admin/dashboard/components/DashboardStats";

export const metadata = {
  title: "Dashboard | Admin Kiichpam Xunáan",
};

export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Panel administrativo
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Resumen general conectado a la API real de reservaciones, pagos y
          ciclo de vida.
        </p>
      </div>

      <DashboardStats />
    </section>
  );
}
import AdminShell from "@/shared/components/admin/AdminShell";

// El panel es autenticado y dinámico: evita render estático y cacheo en el CDN
// (previene que se sirva la respuesta RSC como documento HTML).
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
import AdminLoginForm from "@/features/admin/auth/components/AdminLoginForm";

export const metadata = {
  title: "Admin Login | Kiichpam Xunáan",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <AdminLoginForm />
    </main>
  );
}
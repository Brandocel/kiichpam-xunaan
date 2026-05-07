import { Suspense } from "react";

import AdminLoginForm from "@/features/admin/auth/components/AdminLoginForm";

export const metadata = {
  title: "Login administrador | Kiichpam Xunáan",
};

function AdminLoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-white p-8 shadow-2xl">
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-300" />
        </div>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/admin/dashboard";

  const [email, setEmail] = useState("admin@kiichpam.com");
  const [password, setPassword] = useState("Admin123456*");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "No se pudo iniciar sesión.");
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setErrorMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
    >
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Kiichpam Xunáan
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Panel administrativo
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Inicia sesión para gestionar reservaciones, pagos, usuarios, roles y
          reportes.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Correo
          </label>
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            placeholder="admin@kiichpam.com"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            placeholder="********"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </div>
    </form>
  );
}
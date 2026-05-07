"use client";

import { Menu } from "lucide-react";

type AdminTopbarProps = {
  userName?: string;
  userEmail?: string;
  role?: string;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
};

export default function AdminTopbar({
  userName = "Administrador",
  userEmail = "admin@kiichpam.com",
  role = "ADMIN",
  onOpenMobileMenu,
  onLogout,
}: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-950">
              {userName}
            </p>
            <p className="truncate text-sm text-slate-500">
              {userEmail} · {role}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="hidden rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 lg:inline-flex"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
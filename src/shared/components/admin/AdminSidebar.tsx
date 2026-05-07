"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
import { adminNavigation } from "@/shared/config/admin-navigation";

type AdminSidebarProps = {
  permissions?: string[];
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
};

export default function AdminSidebar({
  permissions = [],
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const canView = (permission?: string) => {
    if (!permission) return true;
    return permissions.includes(permission);
  };

  const visibleItems = adminNavigation.filter((item) => canView(item.permission));

  return (
    <>
      <div
        onClick={onCloseMobile}
        className={[
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white shadow-xl transition-all duration-300 lg:static lg:z-auto lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-72 lg:w-[96px]" : "w-72",
        ].join(" ")}
      >
        <div className="flex h-24 items-center justify-between border-b border-slate-200 px-5">
          <div
            className={[
              "min-w-0 transition-all duration-300",
              collapsed ? "lg:hidden" : "block",
            ].join(" ")}
          >
            <p className="truncate text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
              Kiichpam Xunáan
            </p>
            <h1 className="mt-1 text-[2rem] leading-none font-black text-slate-950">
              Admin
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCloseMobile}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:inline-flex"
              aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {!collapsed && (
            <div className="mb-5 hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-white lg:block">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Sparkles size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold">Panel administrativo</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Gestión interna de reservaciones, pagos y reportes.
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            {visibleItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={onCloseMobile}
                  className={[
                    "group flex items-center rounded-2xl transition-all duration-200",
                    collapsed
                      ? "justify-center px-3 py-3 lg:px-0"
                      : "gap-3 px-4 py-3",
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
                      isActive
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 text-slate-700 group-hover:bg-white",
                    ].join(" ")}
                  >
                    <Icon size={18} />
                  </span>

                  {!collapsed && (
                    <span className="truncate text-sm font-semibold">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? "Cerrar sesión" : undefined}
            className={[
              "group flex w-full items-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-100",
              collapsed
                ? "justify-center px-3 py-3 lg:px-0"
                : "gap-3 px-4 py-3",
            ].join(" ")}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <LogOut size={18} />
            </span>

            {!collapsed && (
              <span className="text-sm font-semibold">Cerrar sesión</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
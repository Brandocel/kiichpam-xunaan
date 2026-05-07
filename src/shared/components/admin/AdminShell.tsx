"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

type AdminSession = {
  email: string;
  name: string;
  role: string;
  permissions: string[];
};

type AdminShellProps = {
  children: React.ReactNode;
};

const STORAGE_KEY = "kiichpam_admin_sidebar_collapsed";

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<AdminSession | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const savedState = window.localStorage.getItem(STORAGE_KEY);
    setIsSidebarCollapsed(savedState === "true");
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/admin/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          setSession(null);
          return;
        }

        const result = await response.json();

        if (result.success) {
          setSession(result.data);
        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      }
    };

    loadSession();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
    });

    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <AdminSidebar
          permissions={session?.permissions || []}
          collapsed={isSidebarCollapsed}
          mobileOpen={isMobileSidebarOpen}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <div className="min-w-0 flex-1">
          <AdminTopbar
            userName={session?.name}
            userEmail={session?.email}
            role={session?.role}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
            onLogout={handleLogout}
          />

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  ShieldCheck,
  CreditCard,
  BarChart3,
  TrendingUp,
  Handshake,
  CalendarPlus,
} from "lucide-react";

export type AdminNavigationItem = {
  label: string;
  href: string;
  permission?: string;
  icon: LucideIcon;
};

export const adminNavigation: AdminNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    permission: "dashboard.view",
    icon: LayoutDashboard,
  },
  {
    label: "Reservaciones",
    href: "/admin/reservaciones",
    permission: "reservations.view",
    icon: CalendarRange,
  },
  {
    label: "Nueva reservación",
    href: "/admin/nueva-reserva",
    permission: "reservations.create",
    icon: CalendarPlus,
  },
  {
    label: "Agentes",
    href: "/admin/agentes",
    permission: "agents.view",
    icon: Handshake,
  },
  {
    label: "Usuarios",
    href: "/admin/usuarios",
    permission: "users.view",
    icon: Users,
  },
  {
    label: "Roles",
    href: "/admin/roles",
    permission: "roles.view",
    icon: ShieldCheck,
  },
  {
    label: "Pagos",
    href: "/admin/pagos",
    permission: "payments.view",
    icon: CreditCard,
  },
  {
    label: "Reportes",
    href: "/admin/reportes",
    permission: "reports.view",
    icon: BarChart3,
  },
  {
    label: "Métricas",
    href: "/admin/metricas",
    permission: "reports.view",
    icon: TrendingUp,
  },
];
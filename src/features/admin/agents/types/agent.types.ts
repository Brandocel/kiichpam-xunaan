export type SalesAgentType =
  | "INTERNAL"
  | "HOTEL"
  | "TAXI"
  | "AGENCY"
  | "INFLUENCER"
  | "OTHER";

export type SalesAgent = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  type: SalesAgentType;
  commissionPercent: number;
  isActive: boolean;
  notes: string | null;
  reservationsCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type SalesAgentPerformanceRow = {
  code: string;
  name: string;
  company: string | null;
  type: string;
  isActive: boolean;
  commissionPercent: number;
  reservations: number;
  closedReservations: number;
  pax: number;
  revenueMXN: number;
  closedRevenueMXN: number;
  commissionMXN: number;
  closeRate: number;
};

export type SalesAgentPerformance = {
  range: { from: string | null; to: string | null };
  totals: {
    agents: number;
    reservations: number;
    closedReservations: number;
    pax: number;
    revenueMXN: number;
    closedRevenueMXN: number;
    commissionMXN: number;
  };
  rows: SalesAgentPerformanceRow[];
};

export type SalesAgentTypeMeta = {
  type: SalesAgentType;
  label: string;
  description: string;
};

export const SALES_AGENT_TYPES: SalesAgentTypeMeta[] = [
  {
    type: "INTERNAL",
    label: "Interno",
    description: "Vendedor del equipo de Kiichpam.",
  },
  {
    type: "HOTEL",
    label: "Hotel",
    description: "Recepción o concierge de un hotel.",
  },
  {
    type: "TAXI",
    label: "Taxi",
    description: "Taxista o transportista que refiere visitantes.",
  },
  {
    type: "AGENCY",
    label: "Agencia",
    description: "Agencia de viajes o tour operador.",
  },
  {
    type: "INFLUENCER",
    label: "Influencer",
    description: "Creador de contenido con link propio.",
  },
  {
    type: "OTHER",
    label: "Otro",
    description: "Cualquier otro socio comercial.",
  },
];

export function agentTypeLabel(type: string): string {
  return SALES_AGENT_TYPES.find((item) => item.type === type)?.label ?? type;
}

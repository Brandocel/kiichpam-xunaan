import type {
  SalesAgent,
  SalesAgentPerformance,
} from "../types/agent.types";

async function adminFetch<T>(
  path: string,
  options: RequestInit,
  fallbackErrorMessage: string
): Promise<T> {
  const response = await fetch(path, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || fallbackErrorMessage);
  }

  return (result?.data ?? result) as T;
}

export async function listAgents(): Promise<SalesAgent[]> {
  const data = await adminFetch<SalesAgent[]>(
    "/api/admin/agents",
    { method: "GET" },
    "No se pudieron cargar los agentes."
  );

  return Array.isArray(data) ? data : [];
}

export async function createAgent(
  payload: Partial<SalesAgent>
): Promise<SalesAgent> {
  return adminFetch<SalesAgent>(
    "/api/admin/agents",
    { method: "POST", body: JSON.stringify(payload) },
    "No se pudo crear el agente."
  );
}

export async function updateAgent(
  id: string,
  payload: Partial<SalesAgent>
): Promise<SalesAgent> {
  return adminFetch<SalesAgent>(
    `/api/admin/agents/${id}`,
    { method: "PATCH", body: JSON.stringify(payload) },
    "No se pudo actualizar el agente."
  );
}

export async function deleteAgent(id: string): Promise<void> {
  await adminFetch<unknown>(
    `/api/admin/agents/${id}`,
    { method: "DELETE" },
    "No se pudo eliminar el agente."
  );
}

export async function getAgentsPerformance(params: {
  from?: string;
  to?: string;
  agentCode?: string;
}): Promise<SalesAgentPerformance> {
  const search = new URLSearchParams();

  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.agentCode) search.set("agentCode", params.agentCode);

  const query = search.toString();

  return adminFetch<SalesAgentPerformance>(
    `/api/admin/agents/performance${query ? `?${query}` : ""}`,
    { method: "GET" },
    "No se pudo obtener el desempeño de los agentes."
  );
}

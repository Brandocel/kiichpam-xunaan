"use client";

import { FormEvent, useEffect, useState } from "react";

import { normalizeAgentCode } from "@/shared/lib/agent-attribution";

import AgentLinkCell from "./AgentLinkCell";
import AgentPerformancePanel from "./AgentPerformancePanel";
import {
  createAgent,
  deleteAgent,
  listAgents,
  updateAgent,
} from "../services/admin-agents.service";
import {
  SALES_AGENT_TYPES,
  agentTypeLabel,
  type SalesAgent,
  type SalesAgentType,
} from "../types/agent.types";

type FormState = {
  name: string;
  code: string;
  company: string;
  email: string;
  phone: string;
  type: SalesAgentType;
  commissionPercent: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  code: "",
  company: "",
  email: "",
  phone: "",
  type: "HOTEL",
  commissionPercent: "10",
  notes: "",
};

export default function AgentsManager() {
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<SalesAgent | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAgents = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      setAgents(await listAgents());
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Error al cargar agentes."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const openCreate = () => {
    setEditingAgent(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (agent: SalesAgent) => {
    setEditingAgent(agent);
    setForm({
      name: agent.name,
      code: agent.code,
      company: agent.company ?? "",
      email: agent.email ?? "",
      phone: agent.phone ?? "",
      type: agent.type,
      commissionPercent: String(agent.commissionPercent ?? 0),
      notes: agent.notes ?? "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const commission = Number(form.commissionPercent);

    if (!Number.isFinite(commission) || commission < 0 || commission > 100) {
      setFormError("La comisión debe ser un número entre 0 y 100.");
      return;
    }

    setIsSaving(true);

    try {
      // El código se manda solo si el usuario lo escribió; si va vacío en el
      // alta, la API lo genera a partir del nombre.
      const payload = {
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        type: form.type,
        commissionPercent: commission,
        notes: form.notes.trim(),
        ...(form.code.trim() ? { code: form.code.trim() } : {}),
      };

      if (editingAgent) {
        await updateAgent(editingAgent.id, payload);
      } else {
        await createAgent(payload);
      }

      setIsModalOpen(false);
      await loadAgents();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "No se pudo guardar."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (agent: SalesAgent) => {
    setBusyId(agent.id);
    setLoadError("");

    try {
      await updateAgent(agent.id, { isActive: !agent.isActive });
      await loadAgents();
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado."
      );
    } finally {
      setBusyId(null);
    }
  };

  const removeAgent = async (agent: SalesAgent) => {
    const confirmed = window.confirm(
      `¿Eliminar al agente "${agent.name}" (${agent.code})? Su link dejará de funcionar. Las reservaciones ya atribuidas conservan su historial.`
    );

    if (!confirmed) return;

    setBusyId(agent.id);
    setLoadError("");

    try {
      await deleteAgent(agent.id);
      await loadAgents();
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "No se pudo eliminar."
      );
    } finally {
      setBusyId(null);
    }
  };

  const previewCode = normalizeAgentCode(form.code || form.name);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Comercial
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Agentes de reservas
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Da de alta hoteles, taxistas, agencias o influencers. Cada uno recibe
          un link propio y toda venta que entre por ahí queda atribuida a su
          nombre, sin perder el canal de origen.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={loadAgents}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Actualizar
            </button>
            <span className="text-sm text-slate-400">
              {agents.length} agente{agents.length === 1 ? "" : "s"}
            </span>
          </div>

          <button
            onClick={openCreate}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Nuevo agente
          </button>
        </div>

        {loadError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loadError}
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Agente
                </th>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Link de venta
                </th>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Tipo
                </th>
                <th className="py-3 text-right text-xs font-bold uppercase text-slate-400">
                  Comisión
                </th>
                <th className="py-3 text-right text-xs font-bold uppercase text-slate-400">
                  Ventas
                </th>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Estado
                </th>
                <th className="py-3 text-right text-xs font-bold uppercase text-slate-400">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-sm text-slate-400"
                  >
                    Cargando agentes...
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-sm text-slate-400"
                  >
                    Aún no hay agentes. Crea el primero para generar su link.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="py-4 pr-4">
                      <p className="text-sm font-bold text-slate-900">
                        {agent.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {agent.company || agent.email || agent.phone || "—"}
                      </p>
                    </td>

                    <td className="py-4 pr-4">
                      <AgentLinkCell code={agent.code} agentName={agent.name} />
                    </td>

                    <td className="py-4 text-sm text-slate-600">
                      {agentTypeLabel(agent.type)}
                    </td>

                    <td className="py-4 text-right text-sm font-semibold text-slate-700">
                      {agent.commissionPercent}%
                    </td>

                    <td className="py-4 text-right text-sm text-slate-600">
                      {agent.reservationsCount ?? 0}
                    </td>

                    <td className="py-4">
                      {agent.isActive ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                          Activo
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                          Inactivo
                        </span>
                      )}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(agent)}
                          disabled={busyId === agent.id}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleActive(agent)}
                          disabled={busyId === agent.id}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          {agent.isActive ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => removeAgent(agent)}
                          disabled={busyId === agent.id}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AgentPerformancePanel />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-950">
              {editingAgent ? "Editar agente" : "Nuevo agente"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingAgent
                ? "Actualiza sus datos y su comisión."
                : "Crea el agente y su link de venta se genera solo."}
            </p>

            {formError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Código del link{" "}
                    <span className="font-normal text-slate-400">
                      (opcional, se genera del nombre)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="MARIA-LOPEZ"
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                  />
                  {previewCode && (
                    <p className="mt-2 text-xs text-slate-400">
                      Link:{" "}
                      <code className="text-slate-600">
                        /es/reservar?ag={previewCode}
                      </code>
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    placeholder="Hotel Riviera"
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tipo
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as SalesAgentType,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                  >
                    {SALES_AGENT_TYPES.map((item) => (
                      <option key={item.type} value={item.type}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Comisión (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={form.commissionPercent}
                    onChange={(e) =>
                      setForm({ ...form, commissionPercent: e.target.value })
                    }
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Se aplica sobre el total de las reservaciones pagadas. El
                    porcentaje se congela en cada venta, así que cambiarlo no
                    altera comisiones ya generadas.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Notas
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSaving
                    ? "Guardando..."
                    : editingAgent
                    ? "Guardar cambios"
                    : "Crear agente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

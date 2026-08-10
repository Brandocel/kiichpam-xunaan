"use client";

import { useCallback, useEffect, useState } from "react";

import { getAgentsPerformance } from "../services/admin-agents.service";
import {
  agentTypeLabel,
  type SalesAgentPerformance,
} from "../types/agent.types";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("es-MX", {
  style: "percent",
  maximumFractionDigits: 0,
});

function firstDayOfMonthISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function lastDayOfMonthISO() {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(
    last.getDate()
  ).padStart(2, "0")}`;
}

export default function AgentPerformancePanel() {
  const [from, setFrom] = useState(firstDayOfMonthISO);
  const [to, setTo] = useState(lastDayOfMonthISO);
  const [data, setData] = useState<SalesAgentPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setData(await getAgentsPerformance({ from, to }));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Error al cargar el desempeño."
      );
    } finally {
      setIsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = data?.rows ?? [];
  const totals = data?.totals;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Ventas por agente
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Por fecha de visita. La comisión se devenga solo sobre
            reservaciones pagadas.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold uppercase text-slate-400">
            Desde
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-1 block h-10 rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-700 outline-none focus:border-slate-950"
            />
          </label>

          <label className="text-xs font-semibold uppercase text-slate-400">
            Hasta
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="mt-1 block h-10 rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-700 outline-none focus:border-slate-950"
            />
          </label>

          <button
            onClick={load}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {totals && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase text-slate-400">
              Reservaciones
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {totals.closedReservations}
              <span className="ml-1 text-sm font-medium text-slate-400">
                / {totals.reservations}
              </span>
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase text-slate-400">
              Visitantes
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {totals.pax}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase text-slate-400">
              Ingreso pagado
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {currency.format(totals.closedRevenueMXN)}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
            <p className="text-xs font-bold uppercase text-emerald-600">
              Comisión a pagar
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">
              {currency.format(totals.commissionMXN)}
            </p>
          </div>
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
                Tipo
              </th>
              <th className="py-3 text-right text-xs font-bold uppercase text-slate-400">
                Pagadas
              </th>
              <th className="py-3 text-right text-xs font-bold uppercase text-slate-400">
                Cierre
              </th>
              <th className="py-3 text-right text-xs font-bold uppercase text-slate-400">
                Pax
              </th>
              <th className="py-3 text-right text-xs font-bold uppercase text-slate-400">
                Ingreso
              </th>
              <th className="py-3 text-right text-xs font-bold uppercase text-slate-400">
                Comisión
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
                  Cargando desempeño...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-sm text-slate-400"
                >
                  Ninguna reservación atribuida a un agente en este rango.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.code}>
                  <td className="py-4">
                    <p className="text-sm font-bold text-slate-900">
                      {row.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {row.company ? `${row.company} · ` : ""}
                      {row.code}
                    </p>
                  </td>
                  <td className="py-4 text-sm text-slate-600">
                    {agentTypeLabel(row.type)}
                  </td>
                  <td className="py-4 text-right text-sm font-semibold text-slate-900">
                    {row.closedReservations}
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      / {row.reservations}
                    </span>
                  </td>
                  <td className="py-4 text-right text-sm text-slate-600">
                    {percent.format(row.closeRate)}
                  </td>
                  <td className="py-4 text-right text-sm text-slate-600">
                    {row.pax}
                  </td>
                  <td className="py-4 text-right text-sm font-semibold text-slate-900">
                    {currency.format(row.closedRevenueMXN)}
                  </td>
                  <td className="py-4 text-right text-sm font-bold text-emerald-700">
                    {currency.format(row.commissionMXN)}
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      {row.commissionPercent}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

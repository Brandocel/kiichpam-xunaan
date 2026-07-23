"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import ReservationStatusBadge from "@/features/admin/reservations/components/ReservationStatusBadge";
import {
  getReservationStatusLabel,
  reservationReferenceOptions,
  reservationStatusReportOptions,
  type AdminReservationListParams,
} from "@/features/admin/reservations/types/reservation.types";
import { formatMoneyFromCents } from "@/features/admin/reservations/utils/reservation-formatters";
import { formatVisitDate } from "@/features/admin/reservations/utils/formatVisitDate";

import {
  MAX_REPORT_RECORDS,
  fetchAllAdminReservations,
} from "../services/admin-reports.service";
import {
  buildReportFileName,
  downloadCsv,
  downloadExcel,
  printReport,
} from "../utils/report-export";
import {
  buildReservationReportTotals,
  mapReservationToReportRow,
  reservationReportColumns,
  type ReservationReportRow,
} from "../utils/reservations-report";

type ReportFilters = {
  from: string;
  to: string;
  status: string;
  reference: string;
  packageCode: string;
  sortBy: NonNullable<AdminReservationListParams["sortBy"]>;
  sortOrder: NonNullable<AdminReservationListParams["sortOrder"]>;
};

const initialFilters: ReportFilters = {
  from: "",
  to: "",
  /**
   * El reporte arranca en "Pagada": es el estado que de verdad importa para
   * ingresos. Los borradores y pagos fallidos se consultan cambiando el filtro.
   */
  status: "PAID",
  reference: "",
  packageCode: "",
  sortBy: "visitDate",
  sortOrder: "asc",
};

const PREVIEW_LIMIT = 100;

const inputClass =
  "h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200";

const labelClass =
  "mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

type QuickRange = {
  key: string;
  label: string;
  getRange: () => { from: string; to: string };
};

const quickRanges: QuickRange[] = [
  {
    key: "all",
    label: "Todo el histórico",
    /**
     * Sin fechas: la API devuelve todas las reservaciones y el servicio
     * recorre todas las páginas.
     */
    getRange: () => ({ from: "", to: "" }),
  },
  {
    key: "today",
    label: "Hoy",
    getRange: () => {
      const today = toDateInputValue(new Date());

      return { from: today, to: today };
    },
  },
  {
    key: "last7",
    label: "Últimos 7 días",
    getRange: () => {
      const today = new Date();

      return {
        from: toDateInputValue(addDays(today, -6)),
        to: toDateInputValue(today),
      };
    },
  },
  {
    key: "last30",
    label: "Últimos 30 días",
    getRange: () => {
      const today = new Date();

      return {
        from: toDateInputValue(addDays(today, -29)),
        to: toDateInputValue(today),
      };
    },
  },
  {
    key: "thisMonth",
    label: "Este mes",
    getRange: () => {
      const today = new Date();

      return {
        from: toDateInputValue(
          new Date(today.getFullYear(), today.getMonth(), 1)
        ),
        to: toDateInputValue(
          new Date(today.getFullYear(), today.getMonth() + 1, 0)
        ),
      };
    },
  },
  {
    key: "lastMonth",
    label: "Mes pasado",
    getRange: () => {
      const today = new Date();

      return {
        from: toDateInputValue(
          new Date(today.getFullYear(), today.getMonth() - 1, 1)
        ),
        to: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 0)),
      };
    },
  },
];

function getQuickRange(key: string) {
  const match = quickRanges.find((range) => range.key === key);

  return match ? match.getRange() : { from: "", to: "" };
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>

      {hint ? (
        <p className="mt-1 text-[11px] font-semibold text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function TableHeadCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  return (
    <th
      className={[
        "border-r border-slate-300 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-700 last:border-r-0",
        alignClass,
      ].join(" ")}
    >
      {children}
    </th>
  );
}

function TableBodyCell({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  return (
    <td
      className={[
        "border-r border-slate-300/70 px-4 py-3 align-middle last:border-r-0",
        alignClass,
        className,
      ].join(" ")}
    >
      {children}
    </td>
  );
}

function getStatusRailClass(status: string) {
  switch (status) {
    case "PAID":
    case "COMPLETED":
      return "border-l-emerald-500";
    case "PROCESSING_PAYMENT":
      return "border-l-amber-500";
    case "CANCELLED":
    case "NO_SHOW":
      return "border-l-red-500";
    case "REFUNDED":
      return "border-l-purple-500";
    default:
      return "border-l-slate-400";
  }
}

function ExportButton({
  children,
  onClick,
  disabled,
  variant = "outline",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "outline" | "solid";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40",
        variant === "solid"
          ? "bg-slate-950 text-white hover:bg-slate-800"
          : "border border-slate-400 bg-white text-slate-700 hover:bg-slate-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function ReservationsReportView() {
  const [formFilters, setFormFilters] = useState<ReportFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters | null>(
    null
  );

  const [rows, setRows] = useState<ReservationReportRow[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [expectedCount, setExpectedCount] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const didAutoRun = useRef(false);

  const totals = useMemo(() => buildReservationReportTotals(rows), [rows]);

  const rangeLabel = useMemo(() => {
    if (!appliedFilters) return "Sin rango aplicado";

    if (!appliedFilters.from && !appliedFilters.to) {
      return "Todo el histórico";
    }

    const from = appliedFilters.from
      ? formatVisitDate(appliedFilters.from)
      : "Inicio";

    const to = appliedFilters.to ? formatVisitDate(appliedFilters.to) : "Hoy";

    return `${from} — ${to}`;
  }, [appliedFilters]);

  const generateReport = async (filters: ReportFilters) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setLoadedCount(0);
    setExpectedCount(0);

    try {
      const result = await fetchAllAdminReservations(
        {
          from: filters.from,
          to: filters.to,
          status: filters.status,
          reference: filters.reference,
          packageCode: filters.packageCode,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        },
        {
          onProgress: (loaded, total) => {
            setLoadedCount(loaded);
            setExpectedCount(total);
          },
        }
      );

      setRows(result.data.map(mapReservationToReportRow));
      setAppliedFilters(filters);
      setTruncated(result.truncated);
      setHasGenerated(true);

      if (result.truncated) {
        setErrorMessage(
          `Hay más de ${MAX_REPORT_RECORDS.toLocaleString("es-MX")} reservaciones en este rango y solo se cargaron las primeras. Acota las fechas para exportar el resto.`
        );
      }
    } catch (error) {
      setRows([]);
      setHasGenerated(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo generar el reporte de reservaciones."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (didAutoRun.current) return;

    didAutoRun.current = true;

    const range = getQuickRange("last30");
    const defaultFilters = { ...initialFilters, ...range };

    setFormFilters(defaultFilters);
    generateReport(defaultFilters);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    generateReport(formFilters);
  };

  const handleReset = () => {
    const range = getQuickRange("last30");
    const defaultFilters = { ...initialFilters, ...range };

    setFormFilters(defaultFilters);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const applyQuickRange = (quickRange: QuickRange) => {
    const range = quickRange.getRange();

    setFormFilters((prev) => ({ ...prev, ...range }));
  };

  const exportMeta = useMemo(() => {
    return [
      { label: "Rango", value: rangeLabel },
      {
        label: "Estado",
        value: appliedFilters?.status
          ? getReservationStatusLabel(appliedFilters.status)
          : "Todos",
      },
      { label: "Origen", value: appliedFilters?.reference || "Todos" },
      { label: "Paquete", value: appliedFilters?.packageCode || "Todos" },
      { label: "Reservaciones", value: String(totals.reservations) },
      { label: "Pax", value: String(totals.pax) },
      { label: "Total", value: formatMoneyFromCents(totals.revenue) },
      {
        label: "Generado",
        value: new Intl.DateTimeFormat("es-MX", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date()),
      },
    ];
  }, [appliedFilters, rangeLabel, totals]);

  const exportPayload = {
    title: "Reporte de reservaciones",
    subtitle: `Reservaciones del rango ${rangeLabel}`,
    meta: exportMeta,
    columns: reservationReportColumns,
    rows,
  };

  const fileNameArgs = {
    prefix: "reporte_reservaciones",
    from: appliedFilters?.from || "",
    to: appliedFilters?.to || "",
  };

  const runExport = (action: () => void, message: string) => {
    setErrorMessage("");

    try {
      action();
      setSuccessMessage(message);
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo generar la exportación."
      );
    }
  };

  const handleDownloadCsv = () =>
    runExport(
      () =>
        downloadCsv({
          columns: reservationReportColumns,
          rows,
          fileName: buildReportFileName({ ...fileNameArgs, extension: "csv" }),
        }),
      `Se descargó el CSV con ${rows.length} reservaciones.`
    );

  const handleDownloadExcel = () =>
    runExport(
      () =>
        downloadExcel({
          ...exportPayload,
          fileName: buildReportFileName({ ...fileNameArgs, extension: "xls" }),
        }),
      `Se descargó el Excel con ${rows.length} reservaciones.`
    );

  const handlePrint = () =>
    runExport(
      () => printReport(exportPayload),
      "Se abrió la vista de impresión. Elige “Guardar como PDF”."
    );

  const previewRows = rows.slice(0, PREVIEW_LIMIT);
  const canExport = !isLoading && rows.length > 0;

  return (
    <section className="space-y-5">
      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Análisis
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Reporte de reservaciones
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-300">
                Elige un rango de fechas, filtra por estado, origen o paquete y
                descarga el reporte en Excel, CSV o PDF sin salir del panel.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <ExportButton
                  onClick={handleDownloadExcel}
                  disabled={!canExport}
                  variant="solid"
                >
                  Descargar Excel
                </ExportButton>

                <ExportButton onClick={handleDownloadCsv} disabled={!canExport}>
                  Descargar CSV
                </ExportButton>

                <ExportButton onClick={handlePrint} disabled={!canExport}>
                  Imprimir / PDF
                </ExportButton>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <div className="border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Reservaciones
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {totals.reservations}
                  </p>
                </div>

                <div className="border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Pax
                  </p>

                  <p className="mt-1 text-xl font-black">{totals.pax}</p>
                </div>

                <div className="border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Total rango
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {formatMoneyFromCents(totals.revenue)}
                  </p>
                </div>

                <div className="border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Pagado
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {formatMoneyFromCents(totals.paidRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Rango rápido
              </span>

              {quickRanges.map((quickRange) => {
                const range = quickRange.getRange();

                const isActive =
                  formFilters.from === range.from && formFilters.to === range.to;

                return (
                  <button
                    key={quickRange.key}
                    type="button"
                    onClick={() => applyQuickRange(quickRange)}
                    className={[
                      "border px-3 py-1.5 text-xs font-black transition",
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-200",
                    ].join(" ")}
                  >
                    {quickRange.label}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className={labelClass}>Desde</label>

                <input
                  type="date"
                  value={formFilters.from}
                  max={formFilters.to || undefined}
                  onChange={(event) =>
                    setFormFilters((prev) => ({
                      ...prev,
                      from: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Hasta</label>

                <input
                  type="date"
                  value={formFilters.to}
                  min={formFilters.from || undefined}
                  onChange={(event) =>
                    setFormFilters((prev) => ({
                      ...prev,
                      to: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Estado</label>

                <select
                  value={formFilters.status}
                  onChange={(event) =>
                    setFormFilters((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  {reservationStatusReportOptions.map((status) => (
                    <option key={status} value={status}>
                      {getReservationStatusLabel(status)}
                    </option>
                  ))}

                  <option value="">Todos</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Origen / Referencia</label>

                <select
                  value={formFilters.reference}
                  onChange={(event) =>
                    setFormFilters((prev) => ({
                      ...prev,
                      reference: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Todos</option>

                  {reservationReferenceOptions.map((reference) => (
                    <option key={reference} value={reference}>
                      {reference}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Paquete</label>

                <input
                  value={formFilters.packageCode}
                  onChange={(event) =>
                    setFormFilters((prev) => ({
                      ...prev,
                      packageCode: event.target.value,
                    }))
                  }
                  placeholder="KX_BASIC"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Ordenar por</label>

                <select
                  value={formFilters.sortBy}
                  onChange={(event) =>
                    setFormFilters((prev) => ({
                      ...prev,
                      sortBy: event.target.value as ReportFilters["sortBy"],
                    }))
                  }
                  className={inputClass}
                >
                  <option value="visitDate">Fecha de visita</option>
                  <option value="createdAt">Creación</option>
                  <option value="totalMXN">Total</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Orden</label>

                <select
                  value={formFilters.sortOrder}
                  onChange={(event) =>
                    setFormFilters((prev) => ({
                      ...prev,
                      sortOrder: event.target
                        .value as ReportFilters["sortOrder"],
                    }))
                  }
                  className={inputClass}
                >
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>

              <div className="flex items-end">
                <p className="text-xs font-semibold leading-5 text-slate-500">
                  Deja <strong>Desde</strong> y <strong>Hasta</strong> vacías
                  para bajar todo el histórico. El archivo incluye{" "}
                  {reservationReportColumns.length} columnas con cliente,
                  paquete, pax, precios y pago.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Limpiar
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? `Generando${expectedCount ? ` ${loadedCount}/${expectedCount}` : ""}...`
                  : "Generar reporte"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {errorMessage && (
        <div
          className={[
            "border px-4 py-3 text-sm font-bold",
            truncated
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Rango" value={rangeLabel} />

        <StatCard
          label="Reservaciones"
          value={totals.reservations}
          hint={
            isLoading
              ? `Cargando ${loadedCount}${expectedCount ? ` de ${expectedCount}` : ""}...`
              : undefined
          }
        />

        <StatCard
          label="Ticket promedio"
          value={formatMoneyFromCents(
            totals.reservations ? totals.revenue / totals.reservations : 0
          )}
        />

        <StatCard
          label="Ingreso pagado"
          value={formatMoneyFromCents(totals.paidRevenue)}
          hint="Estados Pagada y Completada"
        />
      </div>

      {totals.reservations > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="border border-slate-300 bg-white">
            <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                Por estado
              </h2>
            </div>

            <div className="divide-y divide-slate-200">
              {totals.byStatus.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <ReservationStatusBadge status={item.key} />

                  <span className="text-sm font-black text-slate-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-300 bg-white">
            <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                Por origen
              </h2>
            </div>

            <div className="divide-y divide-slate-200">
              {totals.byReference.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <span className="truncate text-sm font-bold text-slate-700">
                    {item.key}
                  </span>

                  <span className="whitespace-nowrap text-sm font-black text-slate-900">
                    {item.count} · {formatMoneyFromCents(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border border-slate-300 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-300 bg-slate-100 px-4 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Vista previa del reporte
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {rows.length > PREVIEW_LIMIT
                ? `Mostrando las primeras ${PREVIEW_LIMIT} de ${rows.length} reservaciones. La exportación incluye todas.`
                : "Estas son las reservaciones que se incluirán en la exportación."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => generateReport(appliedFilters || formFilters)}
            disabled={isLoading}
            className="border border-slate-400 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <div className="overflow-x-auto bg-slate-300">
          <table className="min-w-full border-collapse">
            <thead className="border-b border-slate-400 bg-slate-200">
              <tr>
                <TableHeadCell>Folio</TableHeadCell>
                <TableHeadCell>Cliente</TableHeadCell>
                <TableHeadCell>Visita</TableHeadCell>
                <TableHeadCell>Origen</TableHeadCell>
                <TableHeadCell align="center">Pax</TableHeadCell>
                <TableHeadCell>Estado</TableHeadCell>
                <TableHeadCell align="right">Total</TableHeadCell>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-300">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr
                    key={index}
                    className={[
                      "border-l-4 border-l-slate-400 [&>td]:bg-inherit",
                      index % 2 === 0 ? "bg-white" : "bg-slate-100/80",
                    ].join(" ")}
                  >
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <TableBodyCell key={cellIndex}>
                        <div className="h-4 w-full animate-pulse bg-slate-300/70" />
                      </TableBodyCell>
                    ))}
                  </tr>
                ))
              ) : previewRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="bg-white px-4 py-14 text-center text-sm font-bold text-slate-500"
                  >
                    <div className="mx-auto max-w-sm">
                      <p className="text-base font-black text-slate-800">
                        {hasGenerated
                          ? "No hay reservaciones en el rango"
                          : "Genera el reporte"}
                      </p>

                      <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                        {hasGenerated
                          ? "Amplía el rango de fechas o quita filtros de estado, origen y paquete."
                          : "Selecciona un rango de fechas y presiona Generar reporte."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                previewRows.map((row, index) => (
                  <tr
                    key={row.folio || index}
                    className={[
                      "border-l-4 transition-colors duration-150 [&>td]:bg-inherit",
                      getStatusRailClass(row.status),
                      index % 2 === 0 ? "bg-white" : "bg-slate-100/80",
                      "hover:bg-slate-200/70",
                    ].join(" ")}
                  >
                    <TableBodyCell className="whitespace-nowrap">
                      <p className="text-sm font-black text-slate-950">
                        {row.folio}
                      </p>

                      <span className="mt-1 inline-flex border border-slate-400 bg-slate-200/80 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-slate-700">
                        {row.packageCode}
                      </span>
                    </TableBodyCell>

                    <TableBodyCell>
                      <div className="min-w-[200px]">
                        <p className="max-w-[240px] truncate text-sm font-black text-slate-900">
                          {row.customerName}
                        </p>

                        <p className="mt-1 max-w-[240px] truncate text-xs font-medium text-slate-500">
                          {row.email || "Sin correo"}
                        </p>
                      </div>
                    </TableBodyCell>

                    <TableBodyCell className="whitespace-nowrap">
                      <p className="text-sm font-black text-slate-800">
                        {row.visitDateLabel}
                      </p>
                    </TableBodyCell>

                    <TableBodyCell className="whitespace-nowrap">
                      <span className="inline-flex max-w-[150px] items-center justify-center truncate border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-700">
                        {row.reference}
                      </span>
                    </TableBodyCell>

                    <TableBodyCell align="center" className="whitespace-nowrap">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center border border-slate-400 bg-white px-2 text-sm font-black text-slate-800">
                        {row.totalPax}
                      </span>
                    </TableBodyCell>

                    <TableBodyCell className="whitespace-nowrap">
                      <ReservationStatusBadge status={row.status} />
                    </TableBodyCell>

                    <TableBodyCell align="right" className="whitespace-nowrap">
                      <p className="text-sm font-black text-slate-950">
                        {formatMoneyFromCents(row.totalMXN)}
                      </p>
                    </TableBodyCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-300 bg-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-bold text-slate-600">
            <span className="font-black text-slate-950">{rows.length}</span>{" "}
            reservaciones ·{" "}
            <span className="font-black text-slate-950">{totals.pax}</span> pax ·{" "}
            <span className="font-black text-slate-950">
              {formatMoneyFromCents(totals.revenue)}
            </span>
          </p>

          <div className="flex flex-wrap gap-2">
            <ExportButton onClick={handleDownloadExcel} disabled={!canExport}>
              Excel
            </ExportButton>

            <ExportButton onClick={handleDownloadCsv} disabled={!canExport}>
              CSV
            </ExportButton>

            <ExportButton onClick={handlePrint} disabled={!canExport}>
              PDF
            </ExportButton>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import ReservationStatusBadge from "./ReservationStatusBadge";
import {
  AdminReservationListParams,
  ApiGenericResponse,
  ApiReservation,
  ApiReservationsListResponse,
  getReservationStatusLabel,
  reservationStatusOptions,
} from "../types/reservation.types";
import {
  confirmAdminReservationPaid,
  getAdminReservationEmailStatus,
  getAdminReservationLifecycle,
  getAdminReservations,
  resendAdminReservationEmail,
} from "../services/admin-reservations.service";

const initialFilters: Required<AdminReservationListParams> = {
  page: 1,
  limit: 20,
  search: "",
  status: "",
  packageCode: "",
  email: "",
  from: "",
  to: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

function formatMoneyFromCents(amount: number | null | undefined) {
  const safeAmount = Number(amount || 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(safeAmount / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Sin fecha";

  return new Date(value).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "America/Cancun",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Sin fecha";

  return new Date(value).toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Cancun",
  });
}

function getCustomerName(reservation: ApiReservation) {
  const firstName = reservation.customer?.firstName || "";
  const lastName = reservation.customer?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Cliente sin nombre";
}

function getTotalPassengers(reservation: ApiReservation) {
  return (
    Number(reservation.passengers?.adults || 0) +
    Number(reservation.passengers?.children || 0) +
    Number(reservation.passengers?.infants || 0)
  );
}

function formatValue(value: unknown, fallback = "N/A") {
  if (value === null || value === undefined || value === "") return fallback;

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : fallback;
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function DetailItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-b-0">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span
        className={[
          "max-w-[65%] text-right text-sm text-slate-700",
          highlight ? "text-base font-black text-slate-950" : "font-semibold",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h3>

      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function ReservationsPageView() {
  const [formFilters, setFormFilters] =
    useState<Required<AdminReservationListParams>>(initialFilters);

  const [activeFilters, setActiveFilters] =
    useState<Required<AdminReservationListParams>>(initialFilters);

  const [response, setResponse] = useState<ApiReservationsListResponse | null>(
    null
  );

  const [selectedReservation, setSelectedReservation] =
    useState<ApiReservation | null>(null);

  const [extraInfo, setExtraInfo] = useState<{
    title: string;
    data: ApiGenericResponse | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const reservations = response?.data || [];
  const pagination = response?.pagination;
  const summary = response?.summary;

  const totalRevenueCurrentPage = useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      return acc + Number(reservation.pricing?.totalMXN || 0);
    }, 0);
  }, [reservations]);

  const closeSidePanel = () => {
    setSelectedReservation(null);
    setExtraInfo(null);
  };

  const loadReservations = async (filters: AdminReservationListParams) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getAdminReservations(filters);
      setResponse(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las reservaciones."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations(activeFilters);
  }, [activeFilters]);

  useEffect(() => {
    if (!selectedReservation) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidePanel();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedReservation]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setActiveFilters({
      ...formFilters,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setFormFilters(initialFilters);
    setActiveFilters(initialFilters);
  };

  const handlePageChange = (page: number) => {
    const nextFilters = {
      ...activeFilters,
      page,
    };

    setFormFilters(nextFilters);
    setActiveFilters(nextFilters);
  };

  const handleConfirmPaid = async (reservation: ApiReservation) => {
    const confirmAction = window.confirm(
      `¿Deseas marcar como pagada la reservación ${reservation.folio}?`
    );

    if (!confirmAction) return;

    setIsActionLoading(true);
    setErrorMessage("");

    try {
      await confirmAdminReservationPaid(reservation.folio);
      await loadReservations(activeFilters);

      setSelectedReservation((current) =>
        current?.folio === reservation.folio
          ? {
              ...current,
              status: "PAID",
            }
          : current
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo marcar como pagada."
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResendEmail = async (reservation: ApiReservation) => {
    const confirmAction = window.confirm(
      `¿Deseas reenviar el correo de la reservación ${reservation.folio}?`
    );

    if (!confirmAction) return;

    setIsActionLoading(true);
    setErrorMessage("");

    try {
      const result = await resendAdminReservationEmail(reservation.folio);

      setExtraInfo({
        title: "Resultado de reenvío de correo",
        data: result,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo reenviar el correo."
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLoadLifecycle = async (reservation: ApiReservation) => {
    setIsActionLoading(true);
    setErrorMessage("");

    try {
      const result = await getAdminReservationLifecycle(reservation.folio);

      setExtraInfo({
        title: "Ciclo de vida de la reservación",
        data: result,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo consultar el ciclo de vida."
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLoadEmailStatus = async (reservation: ApiReservation) => {
    setIsActionLoading(true);
    setErrorMessage("");

    try {
      const result = await getAdminReservationEmailStatus(reservation.folio);

      setExtraInfo({
        title: "Estado de correos",
        data: result,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo consultar el estado de correos."
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:flex-row xl:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            Administración
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-950">
            Reservaciones
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Consulta, filtra y administra las reservaciones conectadas a la API.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-black uppercase text-slate-400">
              Total
            </p>
            <p className="mt-1 text-xl font-black text-slate-950">
              {summary?.total || 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-black uppercase text-slate-400">
              Borrador
            </p>
            <p className="mt-1 text-xl font-black text-slate-950">
              {summary?.byStatus?.DRAFT || 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-black uppercase text-slate-400">
              Procesando
            </p>
            <p className="mt-1 text-xl font-black text-slate-950">
              {summary?.byStatus?.PROCESSING_PAYMENT || 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-black uppercase text-slate-400">
              Pagadas
            </p>
            <p className="mt-1 text-xl font-black text-slate-950">
              {summary?.byStatus?.PAID || 0}
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
              Buscar
            </label>
            <input
              value={formFilters.search}
              onChange={(event) =>
                setFormFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                }))
              }
              placeholder="Folio, nombre, email o teléfono"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
              Estado
            </label>
            <select
              value={formFilters.status}
              onChange={(event) =>
                setFormFilters((prev) => ({
                  ...prev,
                  status: event.target.value,
                }))
              }
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">Todos</option>
              {reservationStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {getReservationStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
              Paquete
            </label>
            <input
              value={formFilters.packageCode}
              onChange={(event) =>
                setFormFilters((prev) => ({
                  ...prev,
                  packageCode: event.target.value,
                }))
              }
              placeholder="KX_BASIC"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
              Email
            </label>
            <input
              value={formFilters.email}
              onChange={(event) =>
                setFormFilters((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
              placeholder="cliente@email.com"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
              Desde
            </label>
            <input
              type="date"
              value={formFilters.from}
              onChange={(event) =>
                setFormFilters((prev) => ({
                  ...prev,
                  from: event.target.value,
                }))
              }
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
              Hasta
            </label>
            <input
              type="date"
              value={formFilters.to}
              onChange={(event) =>
                setFormFilters((prev) => ({
                  ...prev,
                  to: event.target.value,
                }))
              }
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
              Ordenar por
            </label>
            <select
              value={formFilters.sortBy}
              onChange={(event) =>
                setFormFilters((prev) => ({
                  ...prev,
                  sortBy: event.target.value,
                }))
              }
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
            >
              <option value="createdAt">Creación</option>
              <option value="visitDate">Fecha de visita</option>
              <option value="folio">Folio</option>
              <option value="status">Estado</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
              Orden
            </label>
            <select
              value={formFilters.sortOrder}
              onChange={(event) =>
                setFormFilters((prev) => ({
                  ...prev,
                  sortOrder: event.target.value as "asc" | "desc",
                }))
              }
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            Limpiar
          </button>

          <button
            type="submit"
            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Buscar
          </button>
        </div>
      </form>

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-black text-slate-950">
            Resultado de reservaciones
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ingreso de la página actual:{" "}
            <strong className="text-slate-950">
              {formatMoneyFromCents(totalRevenueCurrentPage)}
            </strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadReservations(activeFilters)}
          disabled={isLoading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="border-b border-slate-200 bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Folio
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Paquete
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Visita
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Pax
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    Cargando reservaciones desde la API...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    No hay reservaciones con esos filtros.
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => {
                  const isSelected =
                    selectedReservation?.folio === reservation.folio;

                  return (
                    <tr
                      key={reservation.id || reservation.folio}
                      className={[
                        "transition hover:bg-slate-50",
                        isSelected ? "bg-slate-50" : "",
                      ].join(" ")}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-black text-slate-900">
                        {reservation.folio}
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-sm font-black text-slate-900">
                          {getCustomerName(reservation)}
                        </p>

                        <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-500">
                          {reservation.customer?.email || "Sin correo"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {reservation.customer?.phone || "Sin teléfono"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-slate-700">
                        {reservation.package?.code || "Sin paquete"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-600">
                        {formatDate(reservation.visitDate)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-black text-slate-700">
                        {getTotalPassengers(reservation)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <ReservationStatusBadge status={reservation.status} />
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-black text-slate-900">
                        {formatMoneyFromCents(reservation.pricing?.totalMXN)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setExtraInfo(null);
                          }}
                          className={[
                            "rounded-lg px-3 py-2 text-xs font-black transition",
                            isSelected
                              ? "bg-slate-200 text-slate-950"
                              : "bg-slate-950 text-white hover:bg-slate-800",
                          ].join(" ")}
                        >
                          {isSelected ? "Abierto" : "Ver detalle"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex flex-col justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center">
            <p className="text-sm font-bold text-slate-500">
              Página {pagination.page} de {pagination.totalPages} · Total{" "}
              {pagination.total}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedReservation && (
        <>
          <button
            type="button"
            aria-label="Cerrar panel de detalle"
            onClick={closeSidePanel}
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px]"
          />

          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-slate-200 bg-slate-50 shadow-2xl">
            <div className="border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Detalle de reservación
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    {selectedReservation.folio}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ReservationStatusBadge
                      status={selectedReservation.status}
                    />

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                      {formatMoneyFromCents(
                        selectedReservation.pricing?.totalMXN
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeSidePanel}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-xl font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-4">
                <DetailSection title="Cliente">
                  <DetailItem
                    label="Nombre"
                    value={getCustomerName(selectedReservation)}
                  />
                  <DetailItem
                    label="Email"
                    value={selectedReservation.customer?.email || "Sin email"}
                  />
                  <DetailItem
                    label="Teléfono"
                    value={
                      selectedReservation.customer?.phone || "Sin teléfono"
                    }
                  />
                  <DetailItem
                    label="País"
                    value={selectedReservation.customer?.country || "Sin país"}
                  />
                  <DetailItem
                    label="Comentarios"
                    value={
                      selectedReservation.customer?.comments ||
                      "Sin comentarios"
                    }
                  />
                </DetailSection>

                <DetailSection title="Visita">
                  <DetailItem
                    label="Fecha"
                    value={formatDate(selectedReservation.visitDate)}
                  />
                  <DetailItem
                    label="Paquete"
                    value={selectedReservation.package?.code || "Sin paquete"}
                  />
                  <DetailItem
                    label="Adultos"
                    value={selectedReservation.passengers?.adults || 0}
                  />
                  <DetailItem
                    label="Niños"
                    value={selectedReservation.passengers?.children || 0}
                  />
                  <DetailItem
                    label="Infantes"
                    value={selectedReservation.passengers?.infants || 0}
                  />
                  <DetailItem
                    label="Total pax"
                    value={getTotalPassengers(selectedReservation)}
                    highlight
                  />
                </DetailSection>

                <DetailSection title="Precio">
                  <DetailItem
                    label="Subtotal"
                    value={formatMoneyFromCents(
                      selectedReservation.pricing?.peopleSubtotalMXN
                    )}
                  />
                  <DetailItem
                    label="Extras"
                    value={formatMoneyFromCents(
                      selectedReservation.pricing?.extrasMXN
                    )}
                  />
                  <DetailItem
                    label="Descuento"
                    value={formatMoneyFromCents(
                      selectedReservation.pricing?.discountMXN
                    )}
                  />
                  <DetailItem
                    label="Campaña"
                    value={formatMoneyFromCents(
                      selectedReservation.pricing?.campaignDiscountMXN
                    )}
                  />
                  <DetailItem
                    label="Total"
                    value={formatMoneyFromCents(
                      selectedReservation.pricing?.totalMXN
                    )}
                    highlight
                  />
                </DetailSection>

                <DetailSection title="Campaña y cupón">
                  <DetailItem
                    label="Campaña"
                    value={
                      selectedReservation.campaign?.campaignCode ||
                      "Sin campaña"
                    }
                  />
                  <DetailItem
                    label="Aplicados"
                    value={formatValue(
                      selectedReservation.campaign?.appliedCampaignCodes
                    )}
                  />
                  <DetailItem
                    label="Cupón"
                    value={
                      selectedReservation.coupon?.couponCode || "Sin cupón"
                    }
                  />
                  <DetailItem
                    label="Creada"
                    value={formatDateTime(selectedReservation.createdAt)}
                  />
                  <DetailItem
                    label="Actualizada"
                    value={formatDateTime(selectedReservation.updatedAt)}
                  />
                </DetailSection>

                {extraInfo && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">
                      {extraInfo.title}
                    </h3>

                    <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-black p-3 text-xs text-green-300">
                      {JSON.stringify(extraInfo.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white px-5 py-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedReservation.status !== "PAID" && (
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleConfirmPaid(selectedReservation)}
                    className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Marcar como pagada
                  </button>
                )}

                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleResendEmail(selectedReservation)}
                  className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reenviar correo
                </button>

                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleLoadLifecycle(selectedReservation)}
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Ver ciclo de vida
                </button>

                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleLoadEmailStatus(selectedReservation)}
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Estado de correos
                </button>
              </div>

              {isActionLoading && (
                <p className="mt-3 text-center text-xs font-bold text-slate-500">
                  Procesando acción...
                </p>
              )}
            </div>
          </aside>
        </>
      )}
    </section>
  );
}
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import ReservationDetailDrawer from "./detail/ReservationDetailDrawer";
import ReservationLifecycleDrawer from "./lifecycle/ReservationLifecycleDrawer";
import ReservationsTable from "./table/ReservationsTable";
import ReservationsCalendarModal from "./calendar/ReservationsCalendarModal";
import { ReservationsSectionSkeleton } from "./common/ReservationSkeletons";
import {
  AdminReservationListParams,
  ApiReservation,
  ApiReservationsListResponse,
  getReservationStatusLabel,
  reservationStatusOptions,
} from "../types/reservation.types";
import {
  confirmAdminReservationPaid,
  getAdminReservations,
  resendAdminReservationEmail,
} from "../services/admin-reservations.service";
import { formatMoneyFromCents } from "../utils/reservation-formatters";

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

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function isPaidReservation(reservation: ApiReservation) {
  return reservation.status === "PAID";
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

  const [lifecycleReservation, setLifecycleReservation] =
    useState<ApiReservation | null>(null);

  const [calendarIsOpen, setCalendarIsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const reservations = response?.data || [];
  const pagination = response?.pagination;
  const summary = response?.summary;

  const isFirstLoading = isLoading && !response;

  const paidReservationsCurrentPage = useMemo(() => {
    return reservations.filter((reservation) => isPaidReservation(reservation));
  }, [reservations]);

  const paidRevenueCurrentPage = useMemo(() => {
    return paidReservationsCurrentPage.reduce((acc, reservation) => {
      return acc + Number(reservation.pricing?.totalMXN || 0);
    }, 0);
  }, [paidReservationsCurrentPage]);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage("");

    setActiveFilters({
      ...formFilters,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setSuccessMessage("");
    setFormFilters(initialFilters);
    setActiveFilters(initialFilters);
  };

  const handlePageChange = (page: number) => {
    const nextFilters = {
      ...activeFilters,
      page,
    };

    setSuccessMessage("");
    setFormFilters(nextFilters);
    setActiveFilters(nextFilters);
  };

  const openReservationDetail = (reservation: ApiReservation) => {
    setSuccessMessage("");
    setSelectedReservation(reservation);

    if (lifecycleReservation) {
      setLifecycleReservation(reservation);
    }
  };

  const openReservationLifecycle = (reservation: ApiReservation) => {
    setSuccessMessage("");

    if (selectedReservation && selectedReservation.folio !== reservation.folio) {
      setSelectedReservation(reservation);
    }

    setLifecycleReservation(reservation);
  };

  const closeDetailDrawer = () => {
    setSelectedReservation(null);
  };

  const closeLifecycleDrawer = () => {
    setLifecycleReservation(null);
  };

  const openCalendar = () => {
    setSuccessMessage("");
    setCalendarIsOpen(true);
  };

  const closeCalendar = () => {
    setCalendarIsOpen(false);
  };

  const handleOpenReservationFromCalendar = (reservation: ApiReservation) => {
    setCalendarIsOpen(false);
    openReservationDetail(reservation);
  };

  const handleConfirmPaid = async (reservation: ApiReservation) => {
    const confirmAction = window.confirm(
      `¿Deseas marcar como pagada la reservación ${reservation.folio}?`
    );

    if (!confirmAction) return;

    setIsActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await confirmAdminReservationPaid(reservation.folio);
      await loadReservations(activeFilters);

      setSelectedReservation((current) =>
        current?.folio === reservation.folio
          ? { ...current, status: "PAID" }
          : current
      );

      setLifecycleReservation((current) =>
        current?.folio === reservation.folio
          ? { ...current, status: "PAID" }
          : current
      );

      setSuccessMessage(
        `La reservación ${reservation.folio} fue marcada como pagada.`
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
    setSuccessMessage("");

    try {
      await resendAdminReservationEmail(reservation.folio);

      setSuccessMessage(
        `Se solicitó el reenvío del correo de la reservación ${reservation.folio}.`
      );
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

  if (isFirstLoading) {
    return <ReservationsSectionSkeleton />;
  }

  return (
    <section className="space-y-5">
      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Administración
              </p>

              <h1 className="mt-2 text-3xl font-black">Reservaciones</h1>

              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-300">
                Consulta reservaciones, revisa el estado de cada una y abre su
                detalle o ciclo de vida sin perder el contexto de la tabla.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={openCalendar}
                className="self-start border border-white/15 bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-slate-100 xl:self-end"
              >
                Abrir calendario
              </button>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <div className="border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Total
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {summary?.total || 0}
                  </p>
                </div>

                <div className="border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Borrador
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {summary?.byStatus?.DRAFT || 0}
                  </p>
                </div>

                <div className="border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Procesando
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {summary?.byStatus?.PROCESSING_PAYMENT || 0}
                  </p>
                </div>

                <div className="border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Pagadas
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {summary?.byStatus?.PAID || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-4">
          <form onSubmit={handleSubmit}>
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
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
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
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
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
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
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
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
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
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
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
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
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
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
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
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
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
                className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
              >
                Limpiar
              </button>

              <button
                type="submit"
                className="bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      {errorMessage && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Página actual" value={reservations.length} />

        <StatCard
          label="Pagadas en página"
          value={paidReservationsCurrentPage.length}
        />

        <StatCard
          label="Ingreso pagado"
          value={formatMoneyFromCents(paidRevenueCurrentPage)}
        />

        <StatCard label="Total registros" value={pagination?.total || 0} />
      </div>

      <ReservationsTable
        reservations={reservations}
        pagination={pagination}
        isLoading={isLoading}
        selectedReservation={selectedReservation}
        lifecycleReservation={lifecycleReservation}
        onRefresh={() => loadReservations(activeFilters)}
        onPageChange={handlePageChange}
        onOpenDetail={openReservationDetail}
        onOpenLifecycle={openReservationLifecycle}
      />

      <ReservationsCalendarModal
        open={calendarIsOpen}
        onClose={closeCalendar}
        onOpenDetail={handleOpenReservationFromCalendar}
      />

      <ReservationDetailDrawer
        reservation={selectedReservation}
        open={Boolean(selectedReservation)}
        onClose={closeDetailDrawer}
        onConfirmPaid={handleConfirmPaid}
        onResendEmail={handleResendEmail}
        onOpenLifecycle={(reservation) => openReservationLifecycle(reservation)}
        isActionLoading={isActionLoading}
      />

      <ReservationLifecycleDrawer
        reservation={lifecycleReservation}
        open={Boolean(lifecycleReservation)}
        onClose={closeLifecycleDrawer}
        detailIsOpen={Boolean(selectedReservation)}
      />
    </section>
  );
}
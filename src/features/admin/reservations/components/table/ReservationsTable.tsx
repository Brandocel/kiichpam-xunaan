"use client";

import ReservationStatusBadge from "../ReservationStatusBadge";
import type { ApiReservation } from "../../types/reservation.types";
import {
  formatMoneyFromCents,
  getCustomerName,
  getReservationReference,
  getTotalPassengers,
} from "../../utils/reservation-formatters";

type ReservationsTablePagination = {
  page: number;
  totalPages: number;
  total: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

type ReservationsTableProps = {
  reservations: ApiReservation[];
  pagination?: ReservationsTablePagination | null;
  isLoading: boolean;
  selectedReservation: ApiReservation | null;
  lifecycleReservation: ApiReservation | null;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onOpenDetail: (reservation: ApiReservation) => void;
  onOpenLifecycle: (reservation: ApiReservation) => void;
};

function formatVisitDate(value?: string | Date | null) {
  if (!value) {
    return "Sin fecha";
  }

  const rawValue = String(value).trim();

  if (!rawValue) {
    return "Sin fecha";
  }

  let date: Date;

  /**
   * Si viene como fecha simple:
   * 2026-05-11
   *
   * No usamos new Date("2026-05-11") directo porque JS lo interpreta como UTC
   * y en México/Cancún podría moverse al día anterior.
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    date = new Date(`${rawValue}T12:00:00.000-05:00`);
  } else {
    date = value instanceof Date ? value : new Date(rawValue);
  }

  if (Number.isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  const parts = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Cancun",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month =
    parts
      .find((part) => part.type === "month")
      ?.value.replace(".", "")
      .toLowerCase() ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";

  return `${Number(day)} ${month} ${year}`;
}

function getStatusRailClass(status: string | null | undefined) {
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
    case "DRAFT":
    default:
      return "border-l-slate-400";
  }
}

function getReservationRowClass({
  index,
  isActive,
  status,
}: {
  index: number;
  isActive: boolean;
  status: string | null | undefined;
}) {
  const zebraColor = index % 2 === 0 ? "bg-white" : "bg-slate-100/80";

  return [
    "group border-l-4 transition-colors duration-150",
    "[&>td]:bg-inherit",
    getStatusRailClass(status),
    isActive
      ? "bg-slate-200/80 shadow-[inset_0_0_0_1px_#94a3b8]"
      : `${zebraColor} hover:bg-slate-200/70`,
  ].join(" ");
}

function getReferenceBadgeClass(reference?: string | null) {
  const normalized = String(reference || "").toLowerCase();

  if (normalized.includes("facebook")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (normalized.includes("instagram")) {
    return "border-pink-200 bg-pink-50 text-pink-700";
  }

  if (normalized.includes("tiktok")) {
    return "border-slate-300 bg-slate-950 text-white";
  }

  if (normalized.includes("whatsapp")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized.includes("google")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized.includes("directo")) {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  if (normalized.includes("agencia")) {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (normalized.includes("taxi")) {
    return "border-yellow-200 bg-yellow-50 text-yellow-800";
  }

  if (normalized.includes("hotel")) {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  return "border-slate-300 bg-white text-slate-700";
}

function ReferenceBadge({ reference }: { reference?: string | null }) {
  const value = reference || "Pagina WEB";

  return (
    <span
      className={[
        "inline-flex max-w-[150px] items-center justify-center truncate border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide",
        getReferenceBadgeClass(value),
      ].join(" ")}
      title={value}
    >
      {value}
    </span>
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
        "border-r border-slate-300/70 px-4 py-4 align-middle last:border-r-0",
        alignClass,
        className,
      ].join(" ")}
    >
      {children}
    </td>
  );
}

function TableActionButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "border px-3 py-2 text-xs font-black transition",
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-400 bg-white text-slate-700 hover:border-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={["animate-pulse bg-slate-300/70", className].join(" ")} />
  );
}

function TableLoadingRows({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => {
        const zebraColor = index % 2 === 0 ? "bg-white" : "bg-slate-100/80";

        return (
          <tr
            key={index}
            className={[
              "border-l-4 border-l-slate-400",
              "[&>td]:bg-inherit",
              zebraColor,
            ].join(" ")}
          >
            <TableBodyCell className="whitespace-nowrap">
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="mt-2 h-5 w-20" />
            </TableBodyCell>

            <TableBodyCell>
              <div className="min-w-[220px]">
                <SkeletonBlock className="h-4 w-44" />
                <SkeletonBlock className="mt-2 h-3 w-56" />
                <SkeletonBlock className="mt-2 h-3 w-32" />
              </div>
            </TableBodyCell>

            <TableBodyCell className="whitespace-nowrap">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="mt-2 h-3 w-24" />
            </TableBodyCell>

            <TableBodyCell className="whitespace-nowrap">
              <SkeletonBlock className="h-7 w-28" />
            </TableBodyCell>

            <TableBodyCell align="center" className="whitespace-nowrap">
              <div className="flex justify-center">
                <SkeletonBlock className="h-8 w-10" />
              </div>
            </TableBodyCell>

            <TableBodyCell className="whitespace-nowrap">
              <SkeletonBlock className="h-7 w-24" />
            </TableBodyCell>

            <TableBodyCell align="right" className="whitespace-nowrap">
              <div className="flex justify-end">
                <SkeletonBlock className="h-4 w-24" />
              </div>
            </TableBodyCell>

            <TableBodyCell align="right" className="whitespace-nowrap">
              <div className="flex justify-end gap-2">
                <SkeletonBlock className="h-8 w-20" />
                <SkeletonBlock className="h-8 w-16" />
              </div>
            </TableBodyCell>
          </tr>
        );
      })}
    </>
  );
}

function EmptyTableState() {
  return (
    <tr>
      <td
        colSpan={8}
        className="bg-white px-4 py-14 text-center text-sm font-bold text-slate-500"
      >
        <div className="mx-auto max-w-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-slate-300 bg-slate-100 text-slate-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                d="M5 7H19M5 12H19M5 17H13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="mt-3 text-base font-black text-slate-800">
            No hay reservaciones
          </p>

          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
            No se encontraron resultados con los filtros actuales. Limpia los
            filtros o intenta con otro folio, cliente, origen o fecha.
          </p>
        </div>
      </td>
    </tr>
  );
}

function ReservationPackageTag({ code }: { code?: string | null }) {
  return (
    <span className="mt-1 inline-flex border border-slate-400 bg-slate-200/80 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-slate-700">
      {code || "Sin paquete"}
    </span>
  );
}

function PassengerCount({ value }: { value: number }) {
  return (
    <span className="inline-flex h-8 min-w-8 items-center justify-center border border-slate-400 bg-white px-2 text-sm font-black text-slate-800">
      {value}
    </span>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="border border-slate-400 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default function ReservationsTable({
  reservations,
  pagination,
  isLoading,
  selectedReservation,
  lifecycleReservation,
  onRefresh,
  onPageChange,
  onOpenDetail,
  onOpenLifecycle,
}: ReservationsTableProps) {
  return (
    <div className="border border-slate-300 bg-white">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-300 bg-slate-100 px-4 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            Lista de reservaciones
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Vista organizada con separación por filas, columnas, estado y origen
            de la reservación.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
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
              <TableHeadCell>Reservación</TableHeadCell>
              <TableHeadCell>Cliente</TableHeadCell>
              <TableHeadCell>Visita</TableHeadCell>
              <TableHeadCell>Origen</TableHeadCell>
              <TableHeadCell align="center">Pax</TableHeadCell>
              <TableHeadCell>Estado</TableHeadCell>
              <TableHeadCell align="right">Total</TableHeadCell>
              <TableHeadCell align="right">Acciones</TableHeadCell>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-300">
            {isLoading ? (
              <TableLoadingRows rows={6} />
            ) : reservations.length === 0 ? (
              <EmptyTableState />
            ) : (
              reservations.map((reservation, index) => {
                const isDetailOpen =
                  selectedReservation?.folio === reservation.folio;

                const isLifecycleOpen =
                  lifecycleReservation?.folio === reservation.folio;

                const isActive = isDetailOpen || isLifecycleOpen;
                const reference = getReservationReference(reservation);

                return (
                  <tr
                    key={reservation.id || reservation.folio}
                    className={getReservationRowClass({
                      index,
                      isActive,
                      status: reservation.status,
                    })}
                  >
                    <TableBodyCell className="whitespace-nowrap">
                      <div>
                        <p className="text-sm font-black text-slate-950">
                          {reservation.folio}
                        </p>

                        <ReservationPackageTag
                          code={reservation.package?.code}
                        />
                      </div>
                    </TableBodyCell>

                    <TableBodyCell>
                      <div className="min-w-[220px]">
                        <p className="max-w-[260px] truncate text-sm font-black text-slate-900">
                          {getCustomerName(reservation)}
                        </p>

                        <p className="mt-1 max-w-[260px] truncate text-xs font-medium text-slate-500">
                          {reservation.customer?.email || "Sin correo"}
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {reservation.customer?.phone || "Sin teléfono"}
                        </p>
                      </div>
                    </TableBodyCell>

                    <TableBodyCell className="whitespace-nowrap">
                      <p className="text-sm font-black text-slate-800">
                        {formatVisitDate(reservation.visitDate)}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Fecha de visita
                      </p>
                    </TableBodyCell>

                    <TableBodyCell className="whitespace-nowrap">
                      <ReferenceBadge reference={reference} />

                      {reservation.attribution?.utmCampaign ? (
                        <p
                          className="mt-1 max-w-[150px] truncate text-[11px] font-semibold text-slate-500"
                          title={reservation.attribution.utmCampaign}
                        >
                          {reservation.attribution.utmCampaign}
                        </p>
                      ) : null}
                    </TableBodyCell>

                    <TableBodyCell align="center" className="whitespace-nowrap">
                      <PassengerCount value={getTotalPassengers(reservation)} />
                    </TableBodyCell>

                    <TableBodyCell className="whitespace-nowrap">
                      <ReservationStatusBadge status={reservation.status} />
                    </TableBodyCell>

                    <TableBodyCell align="right" className="whitespace-nowrap">
                      <p className="text-sm font-black text-slate-950">
                        {formatMoneyFromCents(reservation.pricing?.totalMXN)}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Total
                      </p>
                    </TableBodyCell>

                    <TableBodyCell align="right" className="whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <TableActionButton
                          active={isDetailOpen}
                          onClick={() => onOpenDetail(reservation)}
                        >
                          Detalle
                        </TableActionButton>

                        <TableActionButton
                          active={isLifecycleOpen}
                          onClick={() => onOpenLifecycle(reservation)}
                        >
                          Ciclo
                        </TableActionButton>
                      </div>
                    </TableBodyCell>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex flex-col gap-3 border-t border-slate-300 bg-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-bold text-slate-600">
            Página{" "}
            <span className="font-black text-slate-950">
              {pagination.page}
            </span>{" "}
            de{" "}
            <span className="font-black text-slate-950">
              {pagination.totalPages || 1}
            </span>{" "}
            ·{" "}
            <span className="font-black text-slate-950">
              {pagination.total}
            </span>{" "}
            registros
          </p>

          <div className="flex items-center gap-2">
            <PaginationButton
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            >
              Anterior
            </PaginationButton>

            <PaginationButton
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Siguiente
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  );
}
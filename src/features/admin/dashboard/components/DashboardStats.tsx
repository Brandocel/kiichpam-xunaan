"use client";

import { useEffect, useMemo, useState } from "react";
import ReservationStatusBadge from "@/features/admin/reservations/components/ReservationStatusBadge";
import {
  ApiReservation,
  ApiReservationsListResponse,
} from "@/features/admin/reservations/types/reservation.types";
import { getAdminReservations } from "@/features/admin/reservations/services/admin-reservations.service";
import Link from "next/link";

function formatMoneyFromCents(amount: number | null | undefined) {
  const safeAmount = Number(amount || 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(safeAmount / 100);
}

function getCustomerName(reservation: ApiReservation) {
  const firstName = reservation.customer?.firstName || "";
  const lastName = reservation.customer?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Cliente sin nombre";
}

export default function DashboardStats() {
  const [response, setResponse] = useState<ApiReservationsListResponse | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);

      try {
        const result = await getAdminReservations({
          page: 1,
          limit: 5,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        setResponse(result);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const reservations = response?.data || [];

  const totalRevenueCurrentPage = useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      return acc + Number(reservation.pricing?.totalMXN || 0);
    }, 0);
  }, [reservations]);

  const stats = [
    {
      label: "Reservaciones",
      value: String(response?.summary?.total || 0),
      description: "Total de reservaciones registradas",
    },
    {
      label: "Borrador",
      value: String(response?.summary?.byStatus?.DRAFT || 0),
      description: "Reservaciones iniciadas o incompletas",
    },
    {
      label: "Procesando",
      value: String(response?.summary?.byStatus?.PROCESSING_PAYMENT || 0),
      description: "Reservaciones en proceso de pago",
    },
    {
      label: "Pagadas",
      value: String(response?.summary?.byStatus?.PAID || 0),
      description: "Reservaciones pagadas correctamente",
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          Cargando dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Reservaciones recientes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ingreso de la página actual:{" "}
              <strong className="text-slate-950">
                {formatMoneyFromCents(totalRevenueCurrentPage)}
              </strong>
            </p>
          </div>

          <Link
            href="/admin/reservaciones"
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Ver todas
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Folio
                </th>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Cliente
                </th>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Paquete
                </th>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Estado
                </th>
                <th className="py-3 text-right text-xs font-bold uppercase text-slate-400">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="py-4 text-sm font-bold text-slate-900">
                    {reservation.folio}
                  </td>
                  <td className="py-4 text-sm text-slate-600">
                    {getCustomerName(reservation)}
                  </td>
                  <td className="py-4 text-sm text-slate-600">
                    {reservation.package?.code || "Sin paquete"}
                  </td>
                  <td className="py-4">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                  <td className="py-4 text-right text-sm font-bold text-slate-900">
                    {formatMoneyFromCents(reservation.pricing?.totalMXN)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {reservations.length === 0 && (
            <p className="py-8 text-center text-sm font-semibold text-slate-500">
              No hay reservaciones recientes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
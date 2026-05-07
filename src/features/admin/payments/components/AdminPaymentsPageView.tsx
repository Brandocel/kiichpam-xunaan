"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ApiReservation,
  ApiReservationsListResponse,
} from "@/features/admin/reservations/types/reservation.types";
import { getAdminReservations } from "@/features/admin/reservations/services/admin-reservations.service";

function formatMoneyFromCents(amount: number | null | undefined) {
  const safeAmount = Number(amount || 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(safeAmount / 100);
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

function getPaymentStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "PAID":
      return "Pagado";
    case "PROCESSING_PAYMENT":
      return "Procesando pago";
    case "DRAFT":
      return "Pendiente";
    case "CANCELLED":
      return "Cancelado";
    case "REFUNDED":
      return "Reembolsado";
    case "COMPLETED":
      return "Completado";
    case "NO_SHOW":
      return "No show";
    default:
      return status || "Sin estado";
  }
}

function getPaymentStatusClass(status: string | null | undefined) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "PROCESSING_PAYMENT":
      return "bg-orange-50 text-orange-700 ring-orange-200";
    case "DRAFT":
      return "bg-slate-50 text-slate-700 ring-slate-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 ring-red-200";
    case "REFUNDED":
      return "bg-purple-50 text-purple-700 ring-purple-200";
    case "COMPLETED":
      return "bg-green-50 text-green-700 ring-green-200";
    case "NO_SHOW":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
}

function getPaymentMethod(reservation: ApiReservation) {
  const payments = Array.isArray(reservation.payments)
    ? reservation.payments
    : [];

  if (payments.length === 0) {
    if (reservation.status === "PAID") return "Pago confirmado";
    if (reservation.status === "PROCESSING_PAYMENT") return "Stripe / En proceso";
    return "Sin pago registrado";
  }

  const lastPayment = payments[payments.length - 1] as Record<string, unknown>;

  const method =
    lastPayment.method ||
    lastPayment.paymentMethod ||
    lastPayment.provider ||
    lastPayment.type ||
    "Pago registrado";

  return String(method);
}

export default function AdminPaymentsPageView() {
  const [response, setResponse] = useState<ApiReservationsListResponse | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const reservations = response?.data || [];
  const summary = response?.summary;

  const totalRevenueCurrentPage = useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      return acc + Number(reservation.pricing?.totalMXN || 0);
    }, 0);
  }, [reservations]);

  const paidReservations = reservations.filter(
    (reservation) => reservation.status === "PAID"
  );

  const pendingReservations = reservations.filter(
    (reservation) =>
      reservation.status === "DRAFT" ||
      reservation.status === "PROCESSING_PAYMENT"
  );

  const loadPayments = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getAdminReservations({
        page: 1,
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      setResponse(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los pagos."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:flex-row xl:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Finanzas
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">Pagos</h1>

          <p className="mt-2 text-sm text-slate-500">
            Consulta pagos, reservaciones pagadas, pagos pendientes y estados de
            cobro conectados a la API real.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <p className="text-xs font-bold uppercase text-slate-400">Total</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {summary?.total || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <p className="text-xs font-bold uppercase text-slate-400">
              Pagadas
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {summary?.byStatus?.PAID || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <p className="text-xs font-bold uppercase text-slate-400">
              Procesando
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {summary?.byStatus?.PROCESSING_PAYMENT || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <p className="text-xs font-bold uppercase text-slate-400">
              Ingreso
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {formatMoneyFromCents(totalRevenueCurrentPage)}
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Pagos confirmados
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {paidReservations.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Reservaciones marcadas como pagadas.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Pendientes
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {pendingReservations.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Borradores o reservaciones procesando pago.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Página actual
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {reservations.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Registros cargados desde la API.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Lista de pagos y reservaciones
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Se toma el estado de pago desde el estado actual de la reservación.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPayments}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Folio
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cliente
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Método
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Estado
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Fecha
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    Cargando pagos desde la API...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    No hay pagos o reservaciones para mostrar.
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-slate-900">
                      {reservation.folio}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-900">
                        {getCustomerName(reservation)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {reservation.customer?.email || "Sin correo"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {reservation.customer?.phone || "Sin teléfono"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">
                      {getPaymentMethod(reservation)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1",
                          getPaymentStatusClass(reservation.status),
                        ].join(" ")}
                      >
                        {getPaymentStatusLabel(reservation.status)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {formatDateTime(reservation.updatedAt)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-black text-slate-900">
                      {formatMoneyFromCents(reservation.pricing?.totalMXN)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
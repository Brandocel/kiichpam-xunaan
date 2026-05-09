"use client";

import type { ReactNode } from "react";
import DrawerShell from "../common/DrawerShell";
import AccordionSection from "../common/AccordionSection";
import ReservationStatusBadge from "../ReservationStatusBadge";
import type { ApiReservation } from "../../types/reservation.types";
import {
  formatDate,
  formatDateTime,
  formatMoneyFromCents,
  formatValue,
  getCustomerName,
  getTotalPassengers,
} from "../../utils/reservation-formatters";

type ReservationDetailDrawerProps = {
  reservation: ApiReservation | null;
  open: boolean;
  onClose: () => void;
  onConfirmPaid: (reservation: ApiReservation) => void;
  onResendEmail: (reservation: ApiReservation) => void;
  onOpenLifecycle: (reservation: ApiReservation) => void;
  isActionLoading: boolean;
};

function DetailItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <span
        className={[
          "max-w-[65%] text-right text-sm",
          highlight
            ? "text-base font-black text-slate-950"
            : "font-semibold text-slate-700",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function MiniSummaryCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

export default function ReservationDetailDrawer({
  reservation,
  open,
  onClose,
  onConfirmPaid,
  onResendEmail,
  onOpenLifecycle,
  isActionLoading,
}: ReservationDetailDrawerProps) {
  if (!reservation) return null;

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      eyebrow="Detalle de reservación"
      title={reservation.folio}
      subtitle="Información principal de la reservación"
      widthClassName="max-w-[36rem]"
      positionClassName="right-0"
      panelZIndexClassName="z-[60]"
      backdropZIndexClassName="z-40"
      showBackdrop
      headerRight={
        <div className="hidden md:flex flex-wrap items-center gap-2">
          <ReservationStatusBadge status={reservation.status} />

          <span className="border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
            {formatMoneyFromCents(reservation.pricing?.totalMXN)}
          </span>
        </div>
      }
      footer={
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {reservation.status !== "PAID" && (
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => onConfirmPaid(reservation)}
                className="bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Marcar pagada
              </button>
            )}

            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => onResendEmail(reservation)}
              className="bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reenviar correo
            </button>

            <button
              type="button"
              onClick={() => onOpenLifecycle(reservation)}
              className="border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 sm:col-span-2"
            >
              Ver ciclo de vida
            </button>
          </div>

          {isActionLoading && (
            <p className="text-center text-xs font-bold text-slate-500">
              Procesando acción...
            </p>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <section className="border border-slate-200 bg-white p-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <MiniSummaryCard
              label="Cliente"
              value={getCustomerName(reservation)}
            />

            <MiniSummaryCard
              label="Visita"
              value={formatDate(reservation.visitDate)}
            />

            <MiniSummaryCard
              label="Pax"
              value={getTotalPassengers(reservation)}
            />
          </div>
        </section>

        <AccordionSection title="Cliente" defaultOpen>
          <DetailItem label="Nombre" value={getCustomerName(reservation)} />

          <DetailItem
            label="Email"
            value={reservation.customer?.email || "Sin email"}
          />

          <DetailItem
            label="Teléfono"
            value={reservation.customer?.phone || "Sin teléfono"}
          />

          <DetailItem
            label="País"
            value={reservation.customer?.country || "Sin país"}
          />

          <DetailItem
            label="Comentarios"
            value={reservation.customer?.comments || "Sin comentarios"}
          />
        </AccordionSection>

        <AccordionSection title="Visita" defaultOpen>
          <DetailItem
            label="Fecha"
            value={formatDate(reservation.visitDate)}
          />

          <DetailItem
            label="Paquete"
            value={reservation.package?.code || "Sin paquete"}
          />

          <DetailItem
            label="Adultos"
            value={reservation.passengers?.adults || 0}
          />

          <DetailItem
            label="Niños"
            value={reservation.passengers?.children || 0}
          />

          <DetailItem
            label="Infantes"
            value={reservation.passengers?.infants || 0}
          />

          <DetailItem
            label="Total pax"
            value={getTotalPassengers(reservation)}
            highlight
          />
        </AccordionSection>

        <AccordionSection title="Precio">
          <DetailItem
            label="Subtotal"
            value={formatMoneyFromCents(
              reservation.pricing?.peopleSubtotalMXN
            )}
          />

          <DetailItem
            label="Extras"
            value={formatMoneyFromCents(reservation.pricing?.extrasMXN)}
          />

          <DetailItem
            label="Descuento"
            value={formatMoneyFromCents(reservation.pricing?.discountMXN)}
          />

          <DetailItem
            label="Campaña"
            value={formatMoneyFromCents(
              reservation.pricing?.campaignDiscountMXN
            )}
          />

          <DetailItem
            label="Total"
            value={formatMoneyFromCents(reservation.pricing?.totalMXN)}
            highlight
          />
        </AccordionSection>

        <AccordionSection title="Promoción">
          <DetailItem
            label="Campaña"
            value={reservation.campaign?.campaignCode || "Sin campaña"}
          />

          <DetailItem
            label="Aplicados"
            value={formatValue(reservation.campaign?.appliedCampaignCodes)}
          />

          <DetailItem
            label="Cupón"
            value={reservation.coupon?.couponCode || "Sin cupón"}
          />
        </AccordionSection>

        <AccordionSection title="Registro">
          <DetailItem
            label="Creada"
            value={formatDateTime(reservation.createdAt)}
          />

          <DetailItem
            label="Actualizada"
            value={formatDateTime(reservation.updatedAt)}
          />
        </AccordionSection>
      </div>
    </DrawerShell>
  );
}
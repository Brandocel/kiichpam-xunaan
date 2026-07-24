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

  /*
    Se mantiene para no romper el componente padre.
    Ya no se muestra el botón "Marcar pagada" dentro del drawer.
  */
  onConfirmPaid: (reservation: ApiReservation) => void;

  onResendEmail: (reservation: ApiReservation) => void;
  onOpenLifecycle: (reservation: ApiReservation) => void;
  isActionLoading: boolean;
};

type PaymentRecord = Record<string, unknown>;

type PaymentBreakdown = {
  peopleBaseMXN: number;
  extrasMXN: number;
  grossSubtotalMXN: number;
  campaignDiscountMXN: number;
  couponDiscountMXN: number;
  inapamDiscountMXN: number;
  otherDiscountMXN: number;
  totalDiscountMXN: number;
  totalMXN: number;
  currency: string;
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

function PaymentLine({
  label,
  value,
  tone = "default",
  strong = false,
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "success" | "danger" | "muted";
  strong?: boolean;
}) {
  const valueClassName = {
    default: "text-slate-800",
    success: "text-emerald-700",
    danger: "text-red-600",
    muted: "text-slate-500",
  }[tone];

  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <span
        className={[
          "max-w-[65%] text-right text-sm",
          strong ? "text-base font-black" : "font-bold",
          valueClassName,
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function PaymentInfoCard({
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

      <p className="mt-1 break-words text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function toMoneyNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatDiscount(value: number) {
  if (value <= 0) return formatMoneyFromCents(0);
  return `- ${formatMoneyFromCents(value)}`;
}

function getPaymentBreakdown(reservation: ApiReservation): PaymentBreakdown {
  const pricing = reservation.pricing;

  const totalMXN = toMoneyNumber(pricing?.totalMXN);
  const extrasMXN = toMoneyNumber(pricing?.extrasMXN);
  const subtotalMXN = toMoneyNumber(pricing?.subtotalMXN);
  const peopleSubtotalMXN = toMoneyNumber(pricing?.peopleSubtotalMXN);

  const campaignDiscountMXN = toMoneyNumber(pricing?.campaignDiscountMXN);
  const couponDiscountMXN = toMoneyNumber(pricing?.couponDiscountMXN);
  const inapamDiscountMXN = toMoneyNumber(pricing?.inapamDiscountMXN);
  const totalDiscountMXN = toMoneyNumber(pricing?.discountMXN);

  const knownDiscountsMXN =
    campaignDiscountMXN + couponDiscountMXN + inapamDiscountMXN;

  const otherDiscountMXN = Math.max(totalDiscountMXN - knownDiscountsMXN, 0);

  /*
    En tu respuesta de API algunos subtotales ya vienen afectados por campaña.
    Para que el desglose sea claro, se reconstruye el subtotal bruto así:

    Total final + descuento total = subtotal antes de descuentos.

    Ejemplo:
    totalMXN: 33700
    discountMXN: 11000
    subtotal bruto: 44700
  */
  const calculatedGrossSubtotalMXN = totalMXN + totalDiscountMXN;

  const fallbackGrossSubtotalMXN = Math.max(
    subtotalMXN + extrasMXN,
    peopleSubtotalMXN + extrasMXN
  );

  const grossSubtotalMXN =
    calculatedGrossSubtotalMXN > 0
      ? calculatedGrossSubtotalMXN
      : fallbackGrossSubtotalMXN;

  const peopleBaseMXN = Math.max(grossSubtotalMXN - extrasMXN, 0);

  return {
    peopleBaseMXN,
    extrasMXN,
    grossSubtotalMXN,
    campaignDiscountMXN,
    couponDiscountMXN,
    inapamDiscountMXN,
    otherDiscountMXN,
    totalDiscountMXN,
    totalMXN,
    currency: pricing?.currency || reservation.package?.currency || "MXN",
  };
}

function getPayments(reservation: ApiReservation): PaymentRecord[] {
  const payments = (reservation as { payments?: unknown }).payments;

  if (!Array.isArray(payments)) return [];

  return payments.filter((payment): payment is PaymentRecord => {
    return Boolean(payment) && typeof payment === "object" && !Array.isArray(payment);
  });
}

function getFirstStringValue(
  payment: PaymentRecord,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = payment[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

function getFirstNumberValue(
  payment: PaymentRecord,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = payment[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsedValue = Number(value);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return null;
}

function PaymentRecordCard({
  payment,
  index,
}: {
  payment: PaymentRecord;
  index: number;
}) {
  const amountMXN = getFirstNumberValue(payment, [
    "amountMXN",
    "amountMxn",
    "montoMXN",
    "montoMxn",
    "amount",
    "monto",
    "totalMXN",
    "totalMxn",
    "total",
  ]);

  const method = getFirstStringValue(payment, [
    "method",
    "paymentMethod",
    "metodo",
    "metodoPago",
    "provider",
    "gateway",
  ]);

  const status = getFirstStringValue(payment, [
    "status",
    "paymentStatus",
    "estado",
    "estadoPago",
  ]);

  const reference = getFirstStringValue(payment, [
    "reference",
    "paymentReference",
    "referencia",
    "transactionId",
    "transactionID",
    "stripePaymentIntentId",
    "paymentIntentId",
    "id",
  ]);

  const paidAt = getFirstStringValue(payment, [
    "paidAt",
    "paymentDate",
    "fechaPago",
    "createdAt",
    "updatedAt",
  ]);

  return (
    <div className="border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          Pago #{index + 1}
        </p>

        <span className="bg-slate-950 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white">
          {status || "Sin estado"}
        </span>
      </div>

      <div className="space-y-1">
        <PaymentLine
          label="Monto"
          value={
            amountMXN !== null
              ? formatMoneyFromCents(amountMXN)
              : "Sin monto"
          }
          strong
        />

        <PaymentLine
          label="Método"
          value={method || "Sin método"}
          tone="muted"
        />

        <PaymentLine
          label="Referencia"
          value={reference || "Sin referencia"}
          tone="muted"
        />

        <PaymentLine
          label="Fecha"
          value={paidAt ? formatDateTime(paidAt) : "Sin fecha"}
          tone="muted"
        />
      </div>
    </div>
  );
}

export default function ReservationDetailDrawer({
  reservation,
  open,
  onClose,
  onResendEmail,
  onOpenLifecycle,
  isActionLoading,
}: ReservationDetailDrawerProps) {
  if (!reservation) return null;

  const paymentBreakdown = getPaymentBreakdown(reservation);
  const payments = getPayments(reservation);

  /*
    Una reservación cobrada por Stripe puede no tener movimientos en
    `payments` si el cobro es anterior al registro en base de datos.
    En ese caso el estado manda y no debe leerse como "sin pago".
  */
  const hasPaymentsPendingSync =
    reservation.status === "PAID" && payments.length === 0;

  const hasCampaignDiscount = paymentBreakdown.campaignDiscountMXN > 0;
  const hasCouponDiscount = paymentBreakdown.couponDiscountMXN > 0;
  const hasInapamDiscount = paymentBreakdown.inapamDiscountMXN > 0;
  const hasOtherDiscount = paymentBreakdown.otherDiscountMXN > 0;
  const hasAnyDiscount = paymentBreakdown.totalDiscountMXN > 0;

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
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <ReservationStatusBadge status={reservation.status} />

          <span className="border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
            {formatMoneyFromCents(reservation.pricing?.totalMXN)}
          </span>
        </div>
      }
      footer={
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
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
              className="border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
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
          <DetailItem label="Fecha" value={formatDate(reservation.visitDate)} />

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

        <AccordionSection title="Pago" defaultOpen>
          <div className="mb-4 grid gap-2 sm:grid-cols-3">
            <PaymentInfoCard
              label="Estado"
              value={<ReservationStatusBadge status={reservation.status} />}
            />

            <PaymentInfoCard label="Moneda" value={paymentBreakdown.currency} />

            <PaymentInfoCard
              label="Pagos"
              value={
                payments.length > 0
                  ? payments.length
                  : hasPaymentsPendingSync
                    ? "Por sincronizar"
                    : "Sin pagos"
              }
            />
          </div>

          <div className="border border-slate-200 bg-white p-4">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              Desglose del monto
            </p>

            <PaymentLine
              label="Personas"
              value={formatMoneyFromCents(paymentBreakdown.peopleBaseMXN)}
            />

            <PaymentLine
              label="Extras"
              value={formatMoneyFromCents(paymentBreakdown.extrasMXN)}
            />

            <PaymentLine
              label="Subtotal"
              value={formatMoneyFromCents(paymentBreakdown.grossSubtotalMXN)}
              strong
            />

            {hasCampaignDiscount && (
              <PaymentLine
                label="Descuento campaña"
                value={formatDiscount(paymentBreakdown.campaignDiscountMXN)}
                tone="success"
              />
            )}

            {hasCouponDiscount && (
              <PaymentLine
                label="Descuento cupón"
                value={formatDiscount(paymentBreakdown.couponDiscountMXN)}
                tone="success"
              />
            )}

            {hasInapamDiscount && (
              <PaymentLine
                label="Descuento INAPAM"
                value={formatDiscount(paymentBreakdown.inapamDiscountMXN)}
                tone="success"
              />
            )}

            {hasOtherDiscount && (
              <PaymentLine
                label="Otros descuentos"
                value={formatDiscount(paymentBreakdown.otherDiscountMXN)}
                tone="success"
              />
            )}

            {!hasAnyDiscount && (
              <PaymentLine
                label="Descuento"
                value={formatMoneyFromCents(0)}
                tone="muted"
              />
            )}

            {hasAnyDiscount && (
              <PaymentLine
                label="Descuento total"
                value={formatDiscount(paymentBreakdown.totalDiscountMXN)}
                tone="success"
                strong
              />
            )}

            <PaymentLine
              label="Total a pagar"
              value={formatMoneyFromCents(paymentBreakdown.totalMXN)}
              strong
            />
          </div>

          <div className="mt-4 border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              Referencias aplicadas
            </p>

            <PaymentLine
              label="Campaña"
              value={reservation.campaign?.campaignCode || "Sin campaña"}
              tone="muted"
            />

            <PaymentLine
              label="Campañas aplicadas"
              value={formatValue(reservation.campaign?.appliedCampaignCodes)}
              tone="muted"
            />

            <PaymentLine
              label="Cupón"
              value={reservation.coupon?.couponCode || "Sin cupón"}
              tone="muted"
            />

            <PaymentLine
              label="Descuento cupón"
              value={formatMoneyFromCents(
                reservation.coupon?.couponDiscountMXN || 0
              )}
              tone={
                Number(reservation.coupon?.couponDiscountMXN || 0) > 0
                  ? "success"
                  : "muted"
              }
            />
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                Pagos registrados
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Aquí se muestran los registros del arreglo{" "}
                <span className="font-black text-slate-700">payments</span> si
                la API los devuelve.
              </p>
            </div>

            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <PaymentRecordCard
                    key={`${reservation.folio}-payment-${index}`}
                    payment={payment}
                    index={index}
                  />
                ))}
              </div>
            ) : hasPaymentsPendingSync ? (
              <div className="border border-dashed border-emerald-300 bg-emerald-50 px-4 py-5 text-center">
                <p className="text-sm font-black text-emerald-800">
                  Cobro confirmado, movimiento por sincronizar
                </p>

                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  La reservación está pagada, pero el cobro se realizó antes de
                  que se guardara el detalle en{" "}
                  <span className="font-black">payments</span>. Sincroniza el
                  pago desde Stripe para verlo aquí.
                </p>
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 bg-white px-4 py-5 text-center">
                <p className="text-sm font-black text-slate-700">
                  Sin pagos registrados
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  La reservación todavía no trae movimientos dentro de{" "}
                  <span className="font-black">payments</span>.
                </p>
              </div>
            )}
          </div>
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
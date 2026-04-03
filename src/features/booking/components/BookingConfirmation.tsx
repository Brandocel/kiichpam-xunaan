"use client";

import { useState } from "react";
import { formatHumanDate, formatMoney } from "../utils/booking-calculations";
import type {
  PaymentIntentData,
  ReservationRecord,
} from "../types/booking.types";

interface BookingConfirmationProps {
  locale: "es" | "en";
  reservation: ReservationRecord | null;
  paymentIntent: PaymentIntentData | null;
  onClose: () => void;
}

function getText(locale: "es" | "en") {
  return locale === "es"
    ? {
        thanks: "Gracias",
        pendingTitle: "Tu reservación está pendiente de pago",
        confirmedTitle: "Tu reservación ha sido confirmada",
        detailTitle: "Detalles de la reserva:",
        customerInfo: "Información del cliente",
        subtotal: "Subtotal",
        total: "Precio total",
        promo: "Promoción",
        inapam: "Descuento INAPAM",
        taxes: "Todos los impuestos incluidos",
        pendingOxxo:
          "Tu reservación quedará confirmada cuando el pago en OXXO se vea reflejado.",
        incorrect:
          "Si algún dato es incorrecto, debes regresar y generar nuevamente el pago.",
        close: "CERRAR",
        oxxoReferenceTitle: "Ficha de pago OXXO",
        voucher: "ABRIR FICHA EN OTRA PESTAÑA",
        expiresAt: "Vence",
        iframeLoading: "Cargando ficha OXXO...",
        iframeError:
          "No se pudo mostrar la ficha dentro de esta pantalla. Ábrela en otra pestaña.",
        reference: "Referencia",
        oxxoInstructionsTitle: "Para pagos en OXXO",
        oxxoInstructionsMail:
          "Enviar ticket de pago al correo reservaciones@cenotexunaan.com y presentar el ticket en taquilla",
        oxxoInstructionsInapam:
          "Favor de mostrar su credencial del INAPAM en taquilla",
      }
    : {
        thanks: "Thank you",
        pendingTitle: "Your reservation is pending payment",
        confirmedTitle: "Your reservation has been confirmed",
        detailTitle: "Reservation details:",
        customerInfo: "Customer information",
        subtotal: "Subtotal",
        total: "Total price",
        promo: "Promotion",
        inapam: "INAPAM Discount",
        taxes: "All taxes included",
        pendingOxxo:
          "Your reservation will be confirmed once the OXXO payment is reflected.",
        incorrect:
          "If any information is incorrect, go back and generate the payment again.",
        close: "CLOSE",
        oxxoReferenceTitle: "OXXO Payment Voucher",
        voucher: "OPEN VOUCHER IN NEW TAB",
        expiresAt: "Expires",
        iframeLoading: "Loading OXXO voucher...",
        iframeError:
          "The voucher could not be displayed inside this screen. Open it in a new tab.",
        reference: "Reference",
        oxxoInstructionsTitle: "For OXXO payments",
        oxxoInstructionsMail:
          "Send the payment ticket to reservaciones@cenotexunaan.com and present the ticket at the ticket office",
        oxxoInstructionsInapam:
          "Please show your INAPAM credential at the ticket office",
      };
}

export default function BookingConfirmation({
  locale,
  reservation,
  paymentIntent,
  onClose,
}: BookingConfirmationProps) {
  const t = getText(locale);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

  if (!reservation) return null;

  const normalizedStatus = (paymentIntent?.status || "").toUpperCase();

  const isPaid =
    normalizedStatus === "PAID" ||
    normalizedStatus === "SUCCEEDED" ||
    normalizedStatus === "SUCCESS";

  const isOxxoPending =
    paymentIntent?.paymentMethod === "oxxo" &&
    (normalizedStatus === "PENDING" ||
      normalizedStatus === "PROCESSING" ||
      normalizedStatus === "REQUIRES_PAYMENT_METHOD" ||
      normalizedStatus === "REQUIRES_ACTION");

  const showVoucherSection = Boolean(
    isOxxoPending &&
      (paymentIntent?.reference ||
        paymentIntent?.hostedVoucherUrl ||
        paymentIntent?.expiresAt)
  );

  const voucherUrl = paymentIntent?.hostedVoucherUrl || "";

  return (
    <div className="w-full">
      <div className="text-center">
        <h2 className="font-[var(--font-be-vietnam-pro)] text-[18px] font-black text-[#C028B9] md:text-[28px]">
          {t.thanks} {reservation.firstName ? `(${reservation.firstName})` : ""}
        </h2>

        <h3 className="mt-2 font-[var(--font-be-vietnam-pro)] text-[26px] font-black text-[#005F74] md:text-[44px]">
          {isPaid ? t.confirmedTitle : t.pendingTitle}
        </h3>

        {isOxxoPending ? (
          <p className="mt-4 text-[15px] font-semibold text-[#C028B9]">
            {t.pendingOxxo}
          </p>
        ) : null}

        {!isPaid && !isOxxoPending ? (
          <p className="mt-4 text-[15px] font-semibold text-red-600">
            {t.incorrect}
          </p>
        ) : null}
      </div>

      {showVoucherSection ? (
        <div className="mx-auto mt-8 w-full max-w-[1120px] rounded-[18px] border border-[#D9D9D9] bg-white p-4 shadow-sm sm:p-5 md:p-6">
          <div className="mb-5">
            <h4 className="font-[var(--font-be-vietnam-pro)] text-[22px] font-black text-[#C028B9]">
              {t.oxxoReferenceTitle}
            </h4>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
              {paymentIntent?.reference ? (
                <div className="rounded-[12px] bg-[#F7F7F7] p-4 min-w-0">
                  <p className="text-[13px] font-semibold text-[#6A6A6A]">
                    {t.reference}
                  </p>

                  <div className="mt-2 overflow-x-auto pb-1">
                    <p className="min-w-max text-[22px] font-black tracking-[0.08em] text-[#005F74] sm:text-[26px] md:text-[30px]">
                      {paymentIntent.reference}
                    </p>
                  </div>
                </div>
              ) : null}

              {paymentIntent?.expiresAt ? (
                <div className="rounded-[12px] bg-[#F7F7F7] p-4 min-w-0">
                  <p className="text-[13px] font-semibold text-[#6A6A6A]">
                    {t.expiresAt}
                  </p>
                  <p className="mt-2 break-words text-[15px] font-bold text-[#005F74] sm:text-[16px] md:text-[18px]">
                    {new Date(paymentIntent.expiresAt).toLocaleString()}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {voucherUrl ? (
            <div className="space-y-4">
              {!iframeLoaded && !iframeFailed ? (
                <div className="rounded-[12px] border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3 text-[14px] font-semibold text-[#005F74]">
                  {t.iframeLoading}
                </div>
              ) : null}

              {iframeFailed ? (
                <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-600">
                  {t.iframeError}
                </div>
              ) : null}

              <div className="overflow-hidden rounded-[16px] border border-[#D9D9D9] bg-white">
                <iframe
                  src={voucherUrl}
                  title="OXXO Voucher"
                  className="w-full bg-white"
                  style={{ height: "clamp(520px, 85vh, 1100px)" }}
                  onLoad={() => setIframeLoaded(true)}
                  onError={() => setIframeFailed(true)}
                />
              </div>

              <div className="flex justify-center">
                <a
                  href={voucherUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[46px] min-w-[260px] max-w-full items-center justify-center rounded-full bg-[#C028B9] px-6 py-3 text-center font-[var(--font-be-vietnam-pro)] text-[12px] font-black uppercase tracking-[0.16em] text-white transition hover:opacity-90 sm:min-w-[280px] sm:text-[13px]"
                >
                  {t.voucher}
                </a>
              </div>

              <div className="mt-6 rounded-[16px] border border-[#D9D0BB] bg-[#F2E8D8] px-4 py-6 text-center sm:px-6 sm:py-8">
                <h5 className="font-[var(--font-be-vietnam-pro)] text-[20px] font-semibold text-[#005F74] underline">
                  {t.oxxoInstructionsTitle}
                </h5>

                <p className="mt-5 font-[var(--font-be-vietnam-pro)] text-[18px] leading-relaxed text-[#005F74] md:text-[22px]">
                  {t.oxxoInstructionsMail}
                </p>

                <p className="mt-4 font-[var(--font-be-vietnam-pro)] text-[18px] leading-relaxed text-[#005F74] md:text-[20px]">
                  {t.oxxoInstructionsInapam}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-10 xl:grid-cols-2">
        <div>
          <h4 className="mb-4 font-[var(--font-be-vietnam-pro)] text-[20px] font-black text-[#005F74]">
            {t.detailTitle}
          </h4>

          <ul className="space-y-2 text-[15px] text-[#005F74]">
            <li>
              <strong>Cliente:</strong> {reservation.firstName}{" "}
              {reservation.lastName}
            </li>
            <li>
              <strong>Folio:</strong> {reservation.folio}
            </li>
            <li>
              <strong>Fecha de visita:</strong>{" "}
              {formatHumanDate(reservation.visitDate, locale)}
            </li>
            <li>
              <strong>Paquete:</strong> {reservation.snapshotName}
            </li>
            <li>
              <strong>Adultos:</strong> {reservation.adults}
            </li>
            <li>
              <strong>Niños:</strong> {reservation.children}
            </li>
            <li>
              <strong>Infantes:</strong> {reservation.infants}
            </li>
            <li>
              <strong>INAPAM:</strong> {reservation.inapamVisitors}
            </li>
            <li>
              <strong>Cupón:</strong> {reservation.couponCode || "-"}
            </li>
            <li>
              <strong>Comentarios:</strong> {reservation.comments || "-"}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-[var(--font-be-vietnam-pro)] text-[20px] font-black text-[#005F74]">
            {t.customerInfo}
          </h4>

          <ul className="space-y-2 text-[15px] text-[#005F74]">
            <li>
              <strong>Correo:</strong> {reservation.email}
            </li>
            <li>
              <strong>Teléfono:</strong> {reservation.phone}
            </li>
            <li>
              <strong>País:</strong> {reservation.country}
            </li>
          </ul>

          <div className="mt-8 space-y-3 text-[15px]">
            <div className="flex items-center justify-between font-bold text-[#005F74]">
              <span>{t.subtotal}</span>
              <span>
                {formatMoney(
                  reservation.subtotalMXN,
                  reservation.currency,
                  locale
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#6A6A6A]">
              <span>{t.promo}</span>
              <span>
                {formatMoney(
                  reservation.couponDiscountMXN ?? 0,
                  reservation.currency,
                  locale
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#6A6A6A]">
              <span>{t.inapam}</span>
              <span>
                {formatMoney(
                  reservation.inapamDiscountMXN ?? 0,
                  reservation.currency,
                  locale
                )}
              </span>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-[22px] font-black text-[#005F74]">
                <span>{t.total}</span>
                <span>
                  {formatMoney(
                    reservation.totalMXN,
                    reservation.currency,
                    locale
                  )}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#005F74]">{t.taxes}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={onClose}
          className="h-[46px] min-w-[220px] rounded-full bg-[#C028B9] px-8 font-[var(--font-be-vietnam-pro)] text-[13px] font-black uppercase tracking-[0.28em] text-white transition hover:opacity-90"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
}
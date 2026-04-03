"use client";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type {
  PaymentIntentData,
  PaymentMethodType,
} from "../types/booking.types";

export interface BookingPaymentFormHandle {
  submit: () => Promise<unknown>;
}

interface BookingPaymentFormProps {
  locale: "es" | "en";
  paymentMethod: PaymentMethodType;
  paymentError: string;
  loadingPayment: boolean;
  paymentIntent: PaymentIntentData | null;
  onChangeMethod: (method: PaymentMethodType) => void;
  onConfirmCardPayment: () => Promise<unknown>;
  onGenerateOxxoPayment: () => Promise<unknown>;
  onCardPaymentSucceeded: (
    paymentIntentId?: string,
    status?: string
  ) => void;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function getText(locale: "es" | "en") {
  return locale === "es"
    ? {
        title: "Finalizar Reservación",
        card: "Tarjeta de crédito / débito",
        oxxo: "Pago en OXXO",
        cardInstructions:
          "Ingresa tus datos de pago para confirmar la reservación.",
        oxxoInstructions:
          "Genera tu referencia OXXO. La reservación quedará pendiente hasta que el pago se vea reflejado.",
        referenceTitle: "Referencia OXXO",
        voucher: "Ver ficha de pago",
        incorrect:
          "Si detectas algún dato incorrecto, regresa al paso anterior antes de generar el pago.",
        stripeNotReady: "Stripe todavía no está listo. Intenta de nuevo.",
        incompletePaymentData: "Completa correctamente los datos de pago.",
        confirmError: "No se pudo confirmar el pago.",
        unconfirmedPayment:
          "El pago fue generado pero aún no se confirmó completamente.",
        unknownStatus: "desconocido",
        processing: "PROCESANDO...",
        expires: "Expira:",
        pendingReference:
          "Presiona el botón para generar tu referencia OXXO.",
      }
    : {
        title: "Complete Reservation",
        card: "Credit / debit card",
        oxxo: "Pay at OXXO",
        cardInstructions:
          "Enter your payment details to confirm the reservation.",
        oxxoInstructions:
          "Generate your OXXO reference. The reservation will remain pending until payment is reflected.",
        referenceTitle: "OXXO reference",
        voucher: "View payment voucher",
        incorrect:
          "If any information is incorrect, go back before generating payment.",
        stripeNotReady: "Stripe is not ready yet. Please try again.",
        incompletePaymentData: "Please complete the payment details correctly.",
        confirmError: "Could not confirm the payment.",
        unconfirmedPayment:
          "The payment was created but has not been fully confirmed yet.",
        unknownStatus: "unknown",
        processing: "PROCESSING...",
        expires: "Expires:",
        pendingReference: "Press the button to generate your OXXO reference.",
      };
}

interface CardPaymentContentHandle {
  confirmPayment: () => Promise<unknown>;
}

interface CardPaymentContentProps {
  locale: "es" | "en";
  loadingPayment: boolean;
  paymentError: string;
  clientSecret: string;
  onCardPaymentSucceeded: (
    paymentIntentId?: string,
    status?: string
  ) => void;
}

const CardPaymentContent = forwardRef<
  CardPaymentContentHandle,
  CardPaymentContentProps
>(function CardPaymentContent(
  {
    locale,
    loadingPayment,
    paymentError,
    clientSecret,
    onCardPaymentSucceeded,
  },
  ref
) {
  const t = getText(locale);
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleConfirmStripePayment() {
    if (!stripe || !elements) {
      setLocalError(t.stripeNotReady);
      return null;
    }

    try {
      setSubmitting(true);
      setLocalError("");

      const { error: submitError } = await elements.submit();

      if (submitError) {
        setLocalError(submitError.message || t.incompletePaymentData);
        return null;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: "if_required",
        confirmParams: {
          return_url: window.location.href,
        },
      });

      if (error) {
        setLocalError(error.message || t.confirmError);
        return null;
      }

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "processing" ||
          paymentIntent.status === "requires_capture")
      ) {
        onCardPaymentSucceeded(paymentIntent.id, paymentIntent.status);
        return paymentIntent;
      }

      setLocalError(
        locale === "es"
          ? `El pago quedó en estado: ${paymentIntent?.status ?? t.unknownStatus}`
          : `Payment ended with status: ${paymentIntent?.status ?? t.unknownStatus}`
      );

      return null;
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : t.unconfirmedPayment
      );
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  useImperativeHandle(ref, () => ({
    confirmPayment: handleConfirmStripePayment,
  }));

  return (
    <div className="space-y-5">
      <p className="text-[14px] text-[#005F74]">{t.cardInstructions}</p>
      <p className="text-[14px] font-semibold text-[#C028B9]">{t.incorrect}</p>

      <div className="rounded-[12px] border border-[#DADADA] bg-white p-4">
        <PaymentElement />
      </div>

      {paymentError ? (
        <p className="text-sm font-semibold text-red-600">{paymentError}</p>
      ) : null}

      {localError ? (
        <p className="text-sm font-semibold text-red-600">{localError}</p>
      ) : null}

      {submitting || loadingPayment ? (
        <p className="text-sm font-semibold text-[#C028B9]">{t.processing}</p>
      ) : null}
    </div>
  );
});

const BookingPaymentForm = forwardRef<
  BookingPaymentFormHandle,
  BookingPaymentFormProps
>(function BookingPaymentForm(
  {
    locale,
    paymentMethod,
    paymentError,
    loadingPayment,
    paymentIntent,
    onChangeMethod,
    onConfirmCardPayment,
    onGenerateOxxoPayment,
    onCardPaymentSucceeded,
  },
  ref
) {
  const t = getText(locale);
  const clientSecret = paymentIntent?.stripe?.clientSecret;
  const cardPaymentRef = useRef<CardPaymentContentHandle>(null);

  const elementOptions = useMemo(() => {
    if (!clientSecret) return undefined;

    return {
      clientSecret,
      appearance: {
        theme: "stripe" as const,
      },
    };
  }, [clientSecret]);

  useImperativeHandle(ref, () => ({
    async submit() {
      if (paymentMethod === "card") {
        if (!clientSecret) {
          return onConfirmCardPayment();
        }

        return cardPaymentRef.current?.confirmPayment();
      }

      if (!paymentIntent?.reference) {
        return onGenerateOxxoPayment();
      }

      return true;
    },
  }));

  return (
    <div className="w-full">
      <h2 className="mb-6 font-[var(--font-be-vietnam-pro)] text-[24px] font-semibold text-[#005F74]">
        {t.title}
      </h2>

      <div className="space-y-6">
        <label className="flex items-center gap-3 text-[16px] text-[#5F5F5F]">
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === "card"}
            onChange={() => onChangeMethod("card")}
          />
          <span>{t.card}</span>
        </label>

        <label className="flex items-center gap-3 text-[16px] text-[#5F5F5F]">
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === "oxxo"}
            onChange={() => onChangeMethod("oxxo")}
          />
          <span>{t.oxxo}</span>
        </label>

        {paymentMethod === "card" ? (
          clientSecret ? (
            <Elements stripe={stripePromise} options={elementOptions}>
              <CardPaymentContent
                ref={cardPaymentRef}
                locale={locale}
                loadingPayment={loadingPayment}
                paymentError={paymentError}
                clientSecret={clientSecret}
                onCardPaymentSucceeded={onCardPaymentSucceeded}
              />
            </Elements>
          ) : (
            <div className="space-y-4">
              <p className="text-[14px] text-[#005F74]">
                {t.cardInstructions}
              </p>
              <p className="text-[14px] font-semibold text-[#C028B9]">
                {t.incorrect}
              </p>

              {paymentError ? (
                <p className="text-sm font-semibold text-red-600">
                  {paymentError}
                </p>
              ) : null}
            </div>
          )
        ) : (
          <div className="space-y-5">
            <p className="text-[14px] text-[#005F74]">{t.oxxoInstructions}</p>
            <p className="text-[14px] font-semibold text-[#C028B9]">
              {t.incorrect}
            </p>

            {paymentError ? (
              <p className="text-sm font-semibold text-red-600">
                {paymentError}
              </p>
            ) : null}

            {loadingPayment ? (
              <p className="text-sm font-semibold text-[#C028B9]">
                {t.processing}
              </p>
            ) : null}

            {paymentIntent?.reference ? (
              <div className="rounded-[12px] border border-[#D8D8D8] bg-white p-4">
                <p className="text-[14px] font-semibold text-[#005F74]">
                  {t.referenceTitle}
                </p>

                <p className="mt-2 text-[22px] font-black tracking-[0.08em] text-[#C028B9]">
                  {paymentIntent.reference}
                </p>

                {paymentIntent.expiresAt ? (
                  <p className="mt-2 text-[13px] text-[#5F5F5F]">
                    {t.expires} {paymentIntent.expiresAt}
                  </p>
                ) : null}

                {paymentIntent.hostedVoucherUrl ? (
                  <a
                    href={paymentIntent.hostedVoucherUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-[14px] font-semibold text-[#005F74] underline"
                  >
                    {t.voucher}
                  </a>
                ) : null}
              </div>
            ) : (
              !paymentError &&
              !loadingPayment && (
                <p className="text-sm text-[#5F5F5F]">{t.pendingReference}</p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default BookingPaymentForm;
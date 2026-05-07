"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AlertTriangle, BadgeCheck, Info, XCircle } from "lucide-react";
import type { PackageItem } from "@/features/home/types/home.types";
import HomePackages from "@/features/home/components/HomePackages";
import BookingForm from "./BookingForm";
import BookingSummary from "./BookingSummary";
import BookingContactForm from "./BookingContactForm";
import BookingPaymentForm, {
  type BookingPaymentFormHandle,
} from "./BookingPaymentForm";
import BookingConfirmation from "./BookingConfirmation";
import BookingSteps from "./BookingSteps";
import { useBooking } from "../hooks/useBooking";

interface BookingSectionProps {
  locale: "es" | "en";
  packages: PackageItem[];
  initialPackageCode?: string;
  initialCampaignCode?: string;
  initialCampaignByPackageCode?: Record<string, string>;
  initialAdults?: number;
  initialChildren?: number;
  initialInfants?: number;
  promotionNotice?: string;
  isModal?: boolean;
  onClose?: () => void;
}

type PromotionFeedbackVariant = "success" | "info" | "warning" | "error";

type PromotionFeedbackState = {
  variant: PromotionFeedbackVariant;
  title: string;
  message: string;
};

interface BookingPromotionFeedbackProps {
  locale: "es" | "en";
  title: string;
  message: string;
  variant?: PromotionFeedbackVariant;
  onClose?: () => void;
  autoCloseMs?: number;
  showProgress?: boolean;
}

const feedbackStyles: Record<
  PromotionFeedbackVariant,
  {
    wrapper: string;
    iconWrapper: string;
    title: string;
    text: string;
    progress: string;
    glow: string;
    icon: ReactNode;
  }
> = {
  success: {
    wrapper:
      "border-[#B7E7C9] bg-[linear-gradient(180deg,#F4FFF8_0%,#ECFFF4_100%)]",
    iconWrapper: "bg-[#17A34A]",
    title: "text-[#0A6B2E]",
    text: "text-[#356348]",
    progress: "bg-[#17A34A]",
    glow: "shadow-[0_18px_42px_rgba(23,163,74,0.18)]",
    icon: <BadgeCheck size={19} strokeWidth={2.5} />,
  },
  info: {
    wrapper:
      "border-[#B7DDF7] bg-[linear-gradient(180deg,#F3FBFF_0%,#EDF8FF_100%)]",
    iconWrapper: "bg-[#0E7490]",
    title: "text-[#005F74]",
    text: "text-[#43606B]",
    progress: "bg-[#0E7490]",
    glow: "shadow-[0_18px_42px_rgba(14,116,144,0.18)]",
    icon: <Info size={19} strokeWidth={2.5} />,
  },
  warning: {
    wrapper:
      "border-[#F3D0A1] bg-[linear-gradient(180deg,#FFF8F1_0%,#FFF3E8_100%)]",
    iconWrapper: "bg-[#D97706]",
    title: "text-[#B45309]",
    text: "text-[#7C5A2A]",
    progress: "bg-[#D97706]",
    glow: "shadow-[0_18px_42px_rgba(217,119,6,0.2)]",
    icon: <AlertTriangle size={19} strokeWidth={2.5} />,
  },
  error: {
    wrapper:
      "border-[#F4C4CC] bg-[linear-gradient(180deg,#FFF5F6_0%,#FFF0F2_100%)]",
    iconWrapper: "bg-[#D92D20]",
    title: "text-[#B42318]",
    text: "text-[#7A3D46]",
    progress: "bg-[#D92D20]",
    glow: "shadow-[0_18px_42px_rgba(217,45,32,0.2)]",
    icon: <XCircle size={19} strokeWidth={2.5} />,
  },
};

function BookingPromotionFeedback({
  locale,
  title,
  message,
  variant = "info",
  onClose,
  autoCloseMs = 6500,
  showProgress = true,
}: BookingPromotionFeedbackProps) {
  const styles = feedbackStyles[variant];

  const [mounted, setMounted] = useState(false);
  const [progressStarted, setProgressStarted] = useState(false);

  const shouldAutoClose = Boolean(onClose && autoCloseMs > 0);

  useEffect(() => {
    setMounted(false);
    setProgressStarted(false);

    const mountTimer = window.setTimeout(() => {
      setMounted(true);
      setProgressStarted(true);
    }, 30);

    return () => {
      window.clearTimeout(mountTimer);
    };
  }, [title, message, variant]);

  useEffect(() => {
    if (!shouldAutoClose) return;

    const closeTimer = window.setTimeout(() => {
      onClose?.();
    }, autoCloseMs);

    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [autoCloseMs, onClose, shouldAutoClose, title, message, variant]);

  return (
    <div
      className="
        pointer-events-none fixed z-[10050]
        left-3 right-3 top-4
        sm:left-auto sm:right-6 sm:top-6 sm:w-[430px]
        md:right-8 md:top-8
      "
    >
      <div
        className={[
          "pointer-events-auto relative overflow-hidden rounded-[20px] border",
          "px-4 py-4 pr-10 md:px-5 md:py-5 md:pr-11",
          styles.wrapper,
          styles.glow,
          "transition-all duration-300 ease-out",
          mounted ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute right-[-36px] top-[-44px] h-[112px] w-[112px] rounded-full bg-white/45" />
        <div className="pointer-events-none absolute bottom-[-62px] left-[-48px] h-[132px] w-[132px] rounded-full bg-white/30" />

        <div className="relative flex items-start gap-3.5">
          <div
            className={[
              "flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full text-white",
              "shadow-[0_10px_22px_rgba(0,0,0,0.16)]",
              styles.iconWrapper,
            ].join(" ")}
          >
            {styles.icon}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={[
                "font-[var(--font-be-vietnam-pro)] text-[15px] font-black leading-[1.2] md:text-[16px]",
                styles.title,
              ].join(" ")}
            >
              {title}
            </p>

            <p
              className={[
                "mt-1.5 font-[var(--font-be-vietnam-pro)] text-[13px] font-medium leading-[1.5] md:text-[14px]",
                styles.text,
              ].join(" ")}
            >
              {message}
            </p>
          </div>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === "es" ? "Cerrar mensaje" : "Close message"}
            className="
              absolute right-3 top-3
              flex h-[28px] w-[28px] items-center justify-center
              rounded-full
              text-[22px] leading-none text-[#6B7280]
              transition
              hover:bg-black/5 hover:text-[#111827]
            "
          >
            ×
          </button>
        ) : null}

        {showProgress && shouldAutoClose ? (
          <div className="absolute bottom-0 left-0 h-[4px] w-full bg-black/5">
            <div
              className={[
                "h-full rounded-r-full transition-[width] ease-linear",
                styles.progress,
              ].join(" ")}
              style={{
                width: progressStarted ? "0%" : "100%",
                transitionDuration: `${autoCloseMs}ms`,
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getFriendlyCampaignFeedback(
  locale: "es" | "en",
  errorMessage: string
): PromotionFeedbackState {
  const raw = errorMessage.toLowerCase();

  const isCampaignNotApplicable =
    raw.includes("requested campaign is not active or not applicable") ||
    raw.includes("campaign is not active") ||
    raw.includes("not applicable") ||
    raw.includes("campaign") ||
    raw.includes("promoción") ||
    raw.includes("promocion");

  if (isCampaignNotApplicable) {
    return {
      variant: "warning",
      title:
        locale === "es"
          ? "La promoción ya no aplica"
          : "This promotion no longer applies",
      message:
        locale === "es"
          ? "La promoción seleccionada no aplica para la configuración actual de tu reservación. Puede ocurrir si cambiaste de paquete o si la promoción ya no está disponible. Puedes continuar ajustando tu reserva o elegir una opción válida."
          : "The selected promotion does not apply to your current booking configuration. This can happen if you changed the package or if the promotion is no longer available. You can adjust your booking or choose a valid option.",
    };
  }

  return {
    variant: "error",
    title:
      locale === "es"
        ? "No pudimos validar la reservación"
        : "We could not validate the booking",
    message:
      locale === "es"
        ? errorMessage ||
          "Ocurrió un problema al validar tu reservación. Revisa los datos e intenta nuevamente."
        : errorMessage ||
          "There was a problem validating your booking. Please review the details and try again.",
  };
}

function getPromotionNoticeFeedback(
  locale: "es" | "en",
  promotionNotice: string
): PromotionFeedbackState | null {
  if (!promotionNotice) return null;

  return {
    variant: "info",
    title: locale === "es" ? "Promoción cargada" : "Promotion loaded",
    message: promotionNotice,
  };
}

export default function BookingSection({
  locale,
  packages,
  initialPackageCode = "",
  initialCampaignCode = "",
  initialCampaignByPackageCode = {},
  initialAdults = 1,
  initialChildren = 0,
  initialInfants = 0,
  promotionNotice = "",
  isModal = false,
  onClose,
}: BookingSectionProps) {
  const booking = useBooking({
    locale,
    initialPackageCode,
    initialCampaignCode,
    initialCampaignByPackageCode,
    initialAdults,
    initialChildren,
    initialInfants,
  });

  const paymentFormRef = useRef<BookingPaymentFormHandle>(null);

  const initialPromotionFeedback = useMemo(
    () => getPromotionNoticeFeedback(locale, promotionNotice),
    [locale, promotionNotice]
  );

  const [promotionFeedback, setPromotionFeedback] =
    useState<PromotionFeedbackState | null>(initialPromotionFeedback);

  const previousErrorRef = useRef("");

  useEffect(() => {
    setPromotionFeedback(initialPromotionFeedback);
    previousErrorRef.current = "";
  }, [initialPromotionFeedback]);

  useEffect(() => {
    const currentError = booking.quoteError || booking.reservationError || "";

    if (!currentError) return;
    if (currentError === previousErrorRef.current) return;

    previousErrorRef.current = currentError;

    setPromotionFeedback(getFriendlyCampaignFeedback(locale, currentError));
  }, [booking.quoteError, booking.reservationError, locale]);

  useEffect(() => {
    if (!booking.quote) return;

    const hasAppliedCampaign =
      Array.isArray(booking.quote?.campaigns?.appliedCampaignCodes) &&
      booking.quote.campaigns.appliedCampaignCodes.length > 0;

    if (!hasAppliedCampaign) return;

    if (!promotionNotice && !initialCampaignCode) return;

    setPromotionFeedback({
      variant: "success",
      title: locale === "es" ? "Promoción aplicada" : "Promotion applied",
      message:
        locale === "es"
          ? "Tu promoción se aplicó correctamente a esta reservación. Revisa el resumen antes de continuar."
          : "Your promotion was successfully applied to this booking. Review the summary before continuing.",
    });
  }, [booking.quote, promotionNotice, initialCampaignCode, locale]);

  const canContinue =
    booking.currentStep === 1
      ? booking.canQuote
      : booking.currentStep === 2
        ? booking.canSubmitContact
        : booking.currentStep === 3
          ? booking.canGeneratePayment
          : false;

  async function handleSummaryAction() {
    if (booking.currentStep === 3) {
      await paymentFormRef.current?.submit();
      return;
    }

    await booking.handlePrimaryAction();
  }

  function handleCloseConfirmation() {
    booking.resetAllFlow();
    onClose?.();
  }

  const content = (
    <div className="relative w-full max-w-[1320px] bg-[#F3F3F3]">
{promotionFeedback ? (
  <BookingPromotionFeedback
          variant={promotionFeedback.variant}
          title={promotionFeedback.title}
          message={promotionFeedback.message}
          onClose={() => setPromotionFeedback(null)}
          autoCloseMs={6500}
          showProgress locale={"es"}  />
) : null}

      <div className="mx-auto w-full max-w-[1180px] px-5 py-6 md:px-10 md:py-8 xl:px-14 xl:py-10">
        <div className="mb-8 border-b border-[#D9D9D9] pb-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Image
                src="/logocircular.svg"
                alt="Kiichpam Xunaan"
                width={82}
                height={82}
                className="h-[68px] w-[68px] object-contain md:h-[82px] md:w-[82px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 font-[var(--font-be-vietnam-pro)] text-[16px] font-semibold text-[#CB27C4] md:text-[18px]">
              <Image
                src="/checkout/candado.png"
                alt="Pagos seguros"
                width={22}
                height={22}
                className="h-[22px] w-[22px] object-contain md:h-[24px] md:w-[24px]"
              />
              <span>
                {locale === "es"
                  ? "Todos los pagos son seguros y encriptados"
                  : "All payments are secure and encrypted"}
              </span>
            </div>

            <BookingSteps
              locale={locale}
              currentStep={booking.currentStep}
              onStepClick={(step) => booking.goToStep(step)}
            />
          </div>
        </div>

        <div
          className={
            booking.currentStep === 4
              ? "grid grid-cols-1 gap-8"
              : "grid grid-cols-1 gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:gap-10"
          }
        >
          <div className="min-w-0">
            {booking.currentStep === 1 ? (
              <BookingForm
                locale={locale}
                packages={packages}
                packageCode={booking.packageCode}
                visitDate={booking.visitDate}
                adults={booking.adults}
                children={booking.children}
                infants={booking.infants}
                inapamVisitors={booking.inapamVisitors}
                quoteError={booking.quoteError || booking.reservationError}
                onPackageChange={booking.setPackageCode}
                onVisitDateChange={booking.setVisitDate}
                onIncrement={booking.increment}
                onDecrement={booking.decrement}
              />
            ) : booking.currentStep === 2 ? (
              <BookingContactForm
                locale={locale}
                firstName={booking.firstName}
                lastName={booking.lastName}
                email={booking.email}
                phone={booking.phone}
                country={booking.country}
                comments={booking.comments}
                acceptedTerms={booking.acceptedTerms}
                acceptedPrivacy={booking.acceptedPrivacy}
                contactError={booking.contactError}
                loadingContact={booking.loadingContact}
                onChange={booking.setContactField}
                onToggleTerms={() =>
                  booking.setAcceptedTerms(!booking.acceptedTerms)
                }
                onTogglePrivacy={() =>
                  booking.setAcceptedPrivacy(!booking.acceptedPrivacy)
                }
              />
            ) : booking.currentStep === 3 ? (
              <BookingPaymentForm
                ref={paymentFormRef}
                locale={locale}
                paymentMethod={booking.paymentMethod}
                paymentError={booking.paymentError}
                loadingPayment={booking.loadingPayment}
                paymentIntent={booking.paymentIntent}
                onChangeMethod={booking.setPaymentMethod}
                onConfirmCardPayment={booking.confirmCardPayment}
                onGenerateOxxoPayment={booking.generateOxxoPayment}
                onCardPaymentSucceeded={booking.handleCardPaymentSucceeded}
              />
            ) : (
              <BookingConfirmation
                locale={locale}
                reservation={booking.reservation}
                paymentIntent={booking.paymentIntent}
                onClose={handleCloseConfirmation}
              />
            )}
          </div>

          {booking.currentStep < 4 ? (
            <div className="min-w-0">
              <BookingSummary
                locale={locale}
                packages={packages}
                packageCode={booking.packageCode}
                visitDate={booking.visitDate}
                adults={booking.adults}
                children={booking.children}
                infants={booking.infants}
                inapamVisitors={booking.inapamVisitors}
                quote={booking.quote}
                couponCode={booking.couponCode}
                loadingQuote={booking.loadingQuote}
                loadingReservation={booking.loadingReservation}
                loadingContact={booking.loadingContact}
                loadingPayment={booking.loadingPayment}
                canContinue={canContinue}
                currentStep={booking.currentStep}
                paymentMethod={booking.paymentMethod}
                paymentIntent={booking.paymentIntent}
                onCouponCodeChange={booking.setCouponCode}
                onPrimaryAction={handleSummaryAction}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <section className="relative w-full overflow-hidden rounded-[18px] bg-[#F3F3F3]">
        {content}
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#4C2C7A]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="h-full w-full scale-[1.02] blur-[1px]">
          <HomePackages packages={packages} locale={locale} />
        </div>
      </div>

      <div className="absolute inset-0 bg-[rgba(76,44,122,0.58)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-0 py-0 md:px-6 md:py-8">
        {content}
      </div>
    </section>
  );
}
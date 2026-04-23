"use client";

import { useRef } from "react";
import Image from "next/image";
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
  isModal?: boolean;
  onClose?: () => void;
}

export default function BookingSection({
  locale,
  packages,
  initialPackageCode = "",
  isModal = false,
  onClose,
}: BookingSectionProps) {
  const booking = useBooking({ locale, initialPackageCode });
  const paymentFormRef = useRef<BookingPaymentFormHandle>(null);

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
    <div className="w-full max-w-[1320px] bg-[#F3F3F3]">
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
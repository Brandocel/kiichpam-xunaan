"use client";

interface BookingStepsProps {
  locale: "es" | "en";
  currentStep?: 1 | 2 | 3 | 4;
  onStepClick?: (step: 1 | 2 | 3 | 4) => void;
}

export default function BookingSteps({
  locale,
  currentStep = 1,
  onStepClick,
}: BookingStepsProps) {
  const labels =
    locale === "es"
      ? ["Reserva", "Contacto", "Pago", "Confirmación"]
      : ["Booking", "Contact", "Payment", "Confirmation"];

  return (
    <div className="mb-4 flex flex-wrap items-center gap-y-2 text-[12px] font-semibold text-[#005F74] md:text-[13px]">
      {labels.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3 | 4;
        const isActive = step === currentStep;
        const isClickable = step < currentStep;

        return (
          <div key={label} className="flex items-center">
            {isClickable ? (
              <button
                type="button"
                onClick={() => onStepClick?.(step)}
                className="cursor-pointer rounded-sm transition hover:text-[#003E4C] hover:underline"
              >
                {step}. {label}
              </button>
            ) : (
              <span
                className={
                  isActive ? "font-bold text-[#003E4C]" : "cursor-default opacity-60"
                }
              >
                {step}. {label}
              </span>
            )}

            {step < labels.length ? <span className="px-1"> &gt; </span> : null}
          </div>
        );
      })}
    </div>
  );
}
"use client";

interface BookingStepsProps {
  locale: "es" | "en";
  currentStep?: 1 | 2 | 3 | 4;
  onStepClick?: (step: 1 | 2 | 3 | 4) => void;
}

function getLabels(locale: "es" | "en") {
  return locale === "es"
    ? ["Reserva", "Contacto", "Pago", "Confirmación"]
    : ["Booking", "Contact", "Payment", "Confirmation"];
}

export default function BookingSteps({
  locale,
  currentStep = 1,
  onStepClick,
}: BookingStepsProps) {
  const labels = getLabels(locale);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-y-1 font-[var(--font-be-vietnam-pro)] text-[12px] font-medium leading-none md:text-[13px]">
      {labels.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3 | 4;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isUpcoming = step > currentStep;

        const baseClass =
          "transition-colors duration-200 leading-none";

        const activeClass = "font-extrabold text-[#003E4C]";
        const completedClass =
          "cursor-pointer text-[#005F74] hover:text-[#003E4C]";
        const upcomingClass = "text-[#5A91A7]";

        return (
          <div key={label} className="flex items-center">
            {isCompleted ? (
              <button
                type="button"
                onClick={() => onStepClick?.(step)}
                className={`${baseClass} ${completedClass}`}
              >
                {step}. {label}
              </button>
            ) : (
              <span
                className={`${baseClass} ${
                  isActive ? activeClass : upcomingClass
                }`}
              >
                {step}. {label}
              </span>
            )}

            {step < labels.length ? (
              <span className="px-1.5 text-[#5A91A7]">&gt;</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
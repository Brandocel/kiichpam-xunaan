interface BookingStepsProps {
    locale: "es" | "en";
    currentStep?: 1 | 2 | 3 | 4;
  }
  
  export default function BookingSteps({
    locale,
    currentStep = 1,
  }: BookingStepsProps) {
    const labels =
      locale === "es"
        ? ["Reserva", "Contacto", "Pago", "Confirmación"]
        : ["Booking", "Contact", "Payment", "Confirmation"];
  
    return (
      <div className="mb-4 text-[12px] font-semibold text-[#005F74]">
        {labels.map((label, index) => {
          const step = index + 1;
          const active = step === currentStep;
  
          return (
            <span key={label} className={active ? "font-bold" : "opacity-60"}>
              {step}. {label}
              {step < labels.length ? " > " : ""}
            </span>
          );
        })}
      </div>
    );
  }
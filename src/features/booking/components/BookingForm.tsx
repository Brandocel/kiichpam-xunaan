"use client";

import type { PackageItem } from "@/features/home/types/home.types";

interface BookingFormProps {
  locale: "es" | "en";
  packages: PackageItem[];
  packageCode: string;
  visitDate: string;
  adults: number;
  children: number;
  infants: number;
  inapamVisitors: number;
  quoteError: string;
  onPackageChange: (value: string) => void;
  onVisitDateChange: (value: string) => void;
  onIncrement: (type: "adults" | "children" | "infants" | "inapam") => void;
  onDecrement: (type: "adults" | "children" | "infants" | "inapam") => void;
}

function getText(locale: "es" | "en") {
  return locale === "es"
    ? {
        choosePackage: "Elige tu paquete",
        chooseDate: "Elige tu fecha de visita",
        adults: "Adulto",
        children: "Niños",
        infants: "Infantes",
        infantsNote: "Infantes entran gratis a partir de 0 a 4 años",
        inapamLabel: "Visitantes INAPAM",
        inapamNote: "El descuento INAPAM aplica a visitantes adultos cobrables.",
        schedule: "Horario:",
        scheduleValue: "De 9:00 am a 5:00 pm",
        scheduleZone: "(horario Zona Centro)",
        selectedPackagePlaceholder: "Nombre del paquete seleccionado",
      }
    : {
        choosePackage: "Choose your package",
        chooseDate: "Choose your visit date",
        adults: "Adults",
        children: "Children",
        infants: "Infants",
        infantsNote: "Infants enter free from 0 to 4 years old",
        inapamLabel: "INAPAM Visitors",
        inapamNote: "INAPAM discount applies to chargeable adult visitors.",
        schedule: "Schedule:",
        scheduleValue: "From 9:00 am to 5:00 pm",
        scheduleZone: "(Central Time)",
        selectedPackagePlaceholder: "Selected package name",
      };
}

export default function BookingForm({
  locale,
  packages,
  packageCode,
  visitDate,
  adults,
  children,
  infants,
  inapamVisitors,
  quoteError,
  onPackageChange,
  onVisitDateChange,
  onIncrement,
  onDecrement,
}: BookingFormProps) {
  const t = getText(locale);
  const selectedPackage = packages.find((item) => item.code === packageCode);

  const titleClass =
    "font-[var(--font-be-vietnam-pro)] text-[24px] font-semibold leading-[100%] tracking-[0] text-[#005F74]";

  return (
    <div className="w-full">
      <div className="space-y-8">
        <div>
          <label className={`mb-3 block ${titleClass}`}>
            {t.choosePackage}
          </label>

          <div className="relative">
            <select
              value={packageCode}
              onChange={(e) => onPackageChange(e.target.value)}
              className="h-[58px] w-full appearance-none rounded-[8px] border border-[#C7C7C7] bg-[#E9E9E9] px-4 pr-14 font-[var(--font-be-vietnam-pro)] text-[18px] font-medium text-[#005F74] outline-none"
            >
              <option value="">{t.selectedPackagePlaceholder}</option>

              {packages.map((item) => (
                <option key={item.id} value={item.code}>
                  {item.translation?.name || item.code}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
              <span className="block h-0 w-0 border-l-[12px] border-r-[12px] border-t-[13px] border-l-transparent border-r-transparent border-t-[#56359A]" />
            </span>
          </div>
        </div>

        <div>
          <label className={`mb-3 block ${titleClass}`}>
            {t.chooseDate}
          </label>

          <div className="relative">
            <input
              type="date"
              value={visitDate}
              onChange={(e) => onVisitDateChange(e.target.value)}
              className="h-[58px] w-full rounded-[8px] border border-[#C7C7C7] bg-[#E9E9E9] px-4 pr-14 font-[var(--font-be-vietnam-pro)] text-[18px] font-medium text-[#005F74] outline-none"
            />

            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
              <span className="block h-0 w-0 border-l-[12px] border-r-[12px] border-t-[13px] border-l-transparent border-r-transparent border-t-[#56359A]" />
            </span>
          </div>
        </div>

        {selectedPackage && (
          <div>
            <h3 className={`mb-8 ${titleClass}`}>
              {selectedPackage.translation?.name || selectedPackage.code}
            </h3>

            <div className="space-y-8">
              <CounterRow
                label={t.adults}
                value={adults}
                onIncrement={() => onIncrement("adults")}
                onDecrement={() => onDecrement("adults")}
              />

              <CounterRow
                label={t.children}
                value={children}
                onIncrement={() => onIncrement("children")}
                onDecrement={() => onDecrement("children")}
              />

              <div>
                <CounterRow
                  label={t.infants}
                  value={infants}
                  onIncrement={() => onIncrement("infants")}
                  onDecrement={() => onDecrement("infants")}
                />
                <p className="mt-2 font-[var(--font-be-vietnam-pro)] text-[14px] font-normal leading-[1.3] text-[#005F74]">
                  {t.infantsNote}
                </p>
              </div>

              <div>
                <CounterRow
                  label={t.inapamLabel}
                  value={inapamVisitors}
                  onIncrement={() => onIncrement("inapam")}
                  onDecrement={() => onDecrement("inapam")}
                />
                <p className="mt-2 font-[var(--font-be-vietnam-pro)] text-[14px] font-normal leading-[1.3] text-[#005F74]">
                  {t.inapamNote}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <p className={titleClass}>{t.schedule}</p>

              <p className="mt-3 font-[var(--font-be-vietnam-pro)] text-[28px] font-medium leading-[100%] text-[#C028B9]">
                {t.scheduleValue}
              </p>

              <p className="mt-1 font-[var(--font-be-vietnam-pro)] text-[14px] font-medium leading-[1.1] text-[#C028B9]">
                {t.scheduleZone}
              </p>
            </div>
          </div>
        )}

        {quoteError ? (
          <p className="font-[var(--font-be-vietnam-pro)] text-sm font-semibold text-red-600">
            {quoteError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

interface CounterRowProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

function CounterRow({
  label,
  value,
  onIncrement,
  onDecrement,
}: CounterRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-[var(--font-be-vietnam-pro)] text-[18px] font-medium leading-[100%] tracking-[0] text-[#005F74]">
        {label}
      </span>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onDecrement}
          className="font-[var(--font-be-vietnam-pro)] text-[32px] font-bold leading-none text-[#483289]"
        >
          –
        </button>

        <span className="min-w-[24px] text-center font-[var(--font-be-vietnam-pro)] text-[24px] font-semibold leading-[100%] text-[#005F74]">
          {value}
        </span>

        <button
          type="button"
          onClick={onIncrement}
          className="font-[var(--font-be-vietnam-pro)] text-[32px] font-bold leading-none text-[#483289]"
        >
          +
        </button>
      </div>
    </div>
  );
}
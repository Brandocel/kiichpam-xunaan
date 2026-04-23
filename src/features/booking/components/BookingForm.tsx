"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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

type CalendarDay = {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
};

function getText(locale: "es" | "en") {
  return locale === "es"
    ? {
        choosePackage: "Elige tu paquete",
        chooseDate: "Elige tu fecha de visita",
        adults: "Adulto",
        children: "Niños",
        infants: "Infantes",
        infantsNote: "Gratis a partir de 0 a 4 años",
        inapamLabel: "Descuento INAPAM",
        inapamNote: "El descuento aplica presentando credencial INAPAM.",
        schedule: "Horario:",
        scheduleValue: "De 9:00 am a 5:00 pm",
        scheduleZone: "(horario Zona Centro)",
        selectedPackagePlaceholder: "Nombre del paquete seleccionado",
        selectDatePlaceholder: "Selecciona una fecha",
        weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
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
        selectDatePlaceholder: "Select a date",
        weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      };
}

function parseISODate(value: string): Date | null {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(value: string, locale: "es" | "en") {
  if (!value) return "";

  const parsedDate = parseISODate(value);
  if (!parsedDate) return value;

  if (locale === "es") {
    const monthsEs = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    return `${parsedDate.getDate()} de ${
      monthsEs[parsedDate.getMonth()]
    } de ${parsedDate.getFullYear()}`;
  }

  const monthsEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${monthsEn[parsedDate.getMonth()]} ${parsedDate.getDate()}, ${parsedDate.getFullYear()}`;
}

function getMonthTitle(date: Date, locale: "es" | "en") {
  const monthsEs = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const monthsEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const months = locale === "es" ? monthsEs : monthsEn;
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarDays(viewDate: Date): CalendarDay[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekDay = firstDayOfMonth.getDay();

  const startDate = new Date(year, month, 1 - firstWeekDay);
  const days: CalendarDay[] = [];

  for (let i = 0; i < 35; i += 1) {
    const current = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + i
    );

    days.push({
      date: current,
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === month,
    });
  }

  return days;
}

interface CustomCalendarProps {
  locale: "es" | "en";
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

function CustomCalendar({
  locale,
  value,
  onChange,
  onClose,
}: CustomCalendarProps) {
  const t = getText(locale);
  const selectedDate = parseISODate(value);
  const initialViewDate = selectedDate ?? new Date();

  const [viewDate, setViewDate] = useState(
    new Date(initialViewDate.getFullYear(), initialViewDate.getMonth(), 1)
  );

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  function goToPreviousMonth() {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }

  function handleSelectDate(date: Date) {
    onChange(toISODate(date));
    onClose();
  }

  return (
    <div className="absolute left-0 top-[calc(100%+10px)] z-[999] w-[390px] max-w-[calc(100vw-40px)] sm:w-[410px] md:w-[430px]">
      <div className="rounded-[8px] bg-[#F3F3F3] p-4 shadow-[0_14px_38px_rgba(0,0,0,0.15)] ring-1 ring-[rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-[var(--font-be-vietnam-pro)] text-[34px] font-semibold leading-none tracking-[-0.03em] text-[#111111] sm:text-[38px] md:text-[40px]">
            {getMonthTitle(viewDate, locale)}
          </h4>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#EEF2F7] text-[#3B82F6] transition hover:scale-[1.05]"
              aria-label={locale === "es" ? "Mes anterior" : "Previous month"}
            >
              <ChevronLeft size={18} strokeWidth={2.4} />
            </button>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#EEF2F7] text-[#3B82F6] transition hover:scale-[1.05]"
              aria-label={locale === "es" ? "Mes siguiente" : "Next month"}
            >
              <ChevronRight size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-x-2.5 gap-y-2 sm:gap-y-2.5">
          {t.weekdayLabels.map((day) => (
            <div
              key={day}
              className="flex h-[26px] items-center justify-center bg-[#F7F7F7] text-center font-[var(--font-be-vietnam-pro)] text-[12px] font-medium text-[#666666] sm:h-[28px] sm:text-[13px]"
            >
              {day}
            </div>
          ))}

          {days.map((day) => {
            const isSelected = isSameDay(selectedDate, day.date);

            return (
              <button
                key={day.date.toISOString()}
                type="button"
                onClick={() => handleSelectDate(day.date)}
                className={`flex h-[40px] items-center justify-center text-center font-[var(--font-be-vietnam-pro)] text-[21px] font-normal leading-none transition sm:h-[42px] sm:text-[22px] md:h-[44px] md:text-[23px] ${
                  day.isCurrentMonth ? "text-[#111111]" : "text-[#C7C7C7]"
                } ${
                  isSelected
                    ? "bg-[#DBE4F3] text-[#4B5563]"
                    : "bg-transparent hover:bg-[#F5F7FB]"
                }`}
              >
                {day.dayNumber}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
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

  const [packageFocused, setPackageFocused] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const dateWrapperRef = useRef<HTMLDivElement>(null);

  const titleClass =
    "font-[var(--font-be-vietnam-pro)] text-[24px] font-semibold leading-[100%] tracking-[0] text-[#005F74]";

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        dateWrapperRef.current &&
        !dateWrapperRef.current.contains(event.target as Node)
      ) {
        setDateOpen(false);
      }
    }

    if (dateOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dateOpen]);

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
              onFocus={() => setPackageFocused(true)}
              onBlur={() => setPackageFocused(false)}
              className="h-[58px] w-full appearance-none rounded-[8px] border border-[#C7C7C7] bg-[#E9E9E9] px-4 pr-14 font-[var(--font-be-vietnam-pro)] text-[18px] font-medium text-[#005F74] outline-none transition"
            >
              <option value="">{t.selectedPackagePlaceholder}</option>

              {packages.map((item) => (
                <option key={item.id} value={item.code}>
                  {item.translation?.name || item.code}
                </option>
              ))}
            </select>

            <ChevronDown
              size={24}
              strokeWidth={2.5}
              className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#56359A] transition-transform duration-200 ${
                packageFocused ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`mb-3 block ${titleClass}`}>
            {t.chooseDate}
          </label>

          <div ref={dateWrapperRef} className="relative">
            <button
              type="button"
              onClick={() => setDateOpen((prev) => !prev)}
              className="flex h-[58px] w-full items-center rounded-[8px] border border-[#C7C7C7] bg-[#E9E9E9] px-4 pr-14 text-left font-[var(--font-be-vietnam-pro)] text-[18px] font-medium text-[#005F74]"
            >
              {visitDate
                ? formatDateForDisplay(visitDate, locale)
                : t.selectDatePlaceholder}
            </button>

            <ChevronDown
              size={24}
              strokeWidth={2.5}
              className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#56359A] transition-transform duration-200 ${
                dateOpen ? "rotate-180" : "rotate-0"
              }`}
            />

            {dateOpen ? (
              <CustomCalendar
                locale={locale}
                value={visitDate}
                onChange={onVisitDateChange}
                onClose={() => setDateOpen(false)}
              />
            ) : null}
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
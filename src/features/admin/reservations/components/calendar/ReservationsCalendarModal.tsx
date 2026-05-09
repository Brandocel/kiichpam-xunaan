"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminReservationListParams,
  ApiReservation,
  getReservationStatusLabel,
} from "../../types/reservation.types";
import { getAdminReservations } from "../../services/admin-reservations.service";
import { formatMoneyFromCents } from "../../utils/reservation-formatters";

type ReservationRecord = ApiReservation & Record<string, unknown>;

type ReservationsCalendarModalProps = {
  open: boolean;
  onClose: () => void;
  onOpenDetail: (reservation: ApiReservation) => void;
};

type StatusStyle = {
  dotClass: string;
  badgeClass: string;
  eventClass: string;
};

const CALENDAR_PAGE_SIZE = 20;
const CALENDAR_MAX_PAGES = 30;

const WEEK_DAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

const STATUS_STYLES: Record<string, StatusStyle> = {
  DRAFT: {
    dotClass: "bg-slate-500",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
    eventClass:
      "border-l-slate-500 bg-slate-50 text-slate-800 hover:bg-slate-100",
  },
  PROCESSING_PAYMENT: {
    dotClass: "bg-blue-500",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    eventClass:
      "border-l-blue-500 bg-blue-50 text-blue-800 hover:bg-blue-100",
  },
  PAID: {
    dotClass: "bg-emerald-500",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    eventClass:
      "border-l-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  },
  CANCELLED: {
    dotClass: "bg-red-500",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
    eventClass: "border-l-red-500 bg-red-50 text-red-800 hover:bg-red-100",
  },
  EXPIRED: {
    dotClass: "bg-orange-500",
    badgeClass: "border-orange-200 bg-orange-50 text-orange-700",
    eventClass:
      "border-l-orange-500 bg-orange-50 text-orange-800 hover:bg-orange-100",
  },
};

const DEFAULT_STATUS_STYLE = STATUS_STYLES.DRAFT;

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getCalendarStart(date: Date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  return addDays(firstDayOfMonth, -firstDayOfMonth.getDay());
}

function buildCalendarDays(date: Date) {
  const start = getCalendarStart(date);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMonthTitle(date: Date) {
  const title = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(date);

  return capitalize(title);
}

function formatLongDate(dateKey: string) {
  const date = dateFromKey(dateKey);

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeDateKey(value: unknown): string {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toDateKey(value);
  }

  if (typeof value === "object" && value !== null && "$date" in value) {
    return normalizeDateKey((value as Record<string, unknown>).$date);
  }

  const rawValue = String(value).trim();

  if (!rawValue) return "";

  const isoMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})/);

  if (isoMatch?.[1]) {
    return isoMatch[1];
  }

  const parsedDate = new Date(rawValue);

  if (!Number.isNaN(parsedDate.getTime())) {
    return toDateKey(parsedDate);
  }

  return "";
}

function normalizeTime(value: unknown): string {
  if (!value) return "";

  const rawValue = String(value).trim();

  if (!rawValue) return "";

  const timeMatch = rawValue.match(/(\d{1,2}):(\d{2})/);

  if (timeMatch) {
    const hour = timeMatch[1].padStart(2, "0");
    const minute = timeMatch[2];

    return `${hour}:${minute}`;
  }

  const amPmMatch = rawValue.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);

  if (amPmMatch) {
    let hour = Number(amPmMatch[1]);
    const minute = amPmMatch[2] || "00";
    const period = amPmMatch[3].toLowerCase();

    if (period === "pm" && hour < 12) {
      hour += 12;
    }

    if (period === "am" && hour === 12) {
      hour = 0;
    }

    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  return rawValue;
}

function readValueByPath(source: Record<string, unknown>, path: string[]) {
  let current: unknown = source;

  for (const key of path) {
    if (!current || typeof current !== "object") {
      return "";
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function readFirstValue(source: Record<string, unknown>, paths: string[][]) {
  for (const path of paths) {
    const value = readValueByPath(source, path);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
}

function readFirstString(source: Record<string, unknown>, paths: string[][]) {
  const value = readFirstValue(source, paths);

  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return "";
  }

  return String(value).trim();
}

function getReservationDateKey(reservation: ReservationRecord) {
  const value = readFirstValue(reservation, [
    ["visitDate"],
    ["reservationDate"],
    ["bookingDate"],
    ["date"],
    ["fecha"],
    ["createdAt"],
    ["recogida", "fecha"],
    ["pickup", "date"],
    ["pickup", "fecha"],
    ["schedule", "date"],
  ]);

  return normalizeDateKey(value);
}

function getReservationTime(reservation: ReservationRecord) {
  const value = readFirstValue(reservation, [
    ["visitTime"],
    ["reservationTime"],
    ["bookingTime"],
    ["pickupTime"],
    ["time"],
    ["hora"],
    ["hour"],
    ["horaCita"],
    ["recogida", "pickup"],
    ["recogida", "hora"],
    ["pickup", "time"],
    ["pickup", "hour"],
    ["schedule", "time"],
  ]);

  return normalizeTime(value);
}

function getReservationFolio(reservation: ReservationRecord) {
  return readFirstString(reservation, [
    ["folio"],
    ["reservationFolio"],
    ["reservationCode"],
    ["code"],
    ["cuponCode"],
  ]);
}

function getCustomerName(reservation: ReservationRecord) {
  const directName = readFirstString(reservation, [
    ["customerName"],
    ["clientName"],
    ["fullName"],
    ["name"],
    ["nombre"],
    ["contact", "fullName"],
    ["customer", "fullName"],
  ]);

  if (directName) return directName;

  const firstName = readFirstString(reservation, [
    ["contact", "firstName"],
    ["contact", "name"],
    ["customer", "firstName"],
    ["customer", "name"],
    ["firstName"],
  ]);

  const lastName = readFirstString(reservation, [
    ["contact", "lastName"],
    ["customer", "lastName"],
    ["lastName"],
  ]);

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Cliente";
}

function getPackageCode(reservation: ReservationRecord) {
  return readFirstString(reservation, [
    ["packageCode"],
    ["tourCode"],
    ["productCode"],
    ["package", "code"],
    ["tour", "code"],
    ["product", "code"],
  ]);
}

function getReservationTotal(reservation: ReservationRecord) {
  const pricing = reservation.pricing;

  if (pricing && typeof pricing === "object") {
    const totalMXN = (pricing as Record<string, unknown>).totalMXN;
    return Number(totalMXN || 0);
  }

  const totalMXN = readValueByPath(reservation, ["totalMXN"]);

  return Number(totalMXN || 0);
}

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] || DEFAULT_STATUS_STYLE;
}

function getSafeStatusLabel(status: string) {
  try {
    return getReservationStatusLabel(status as ApiReservation["status"]);
  } catch {
    return status || "Sin estado";
  }
}

function isSameMonth(date: Date, currentDate: Date) {
  return (
    date.getFullYear() === currentDate.getFullYear() &&
    date.getMonth() === currentDate.getMonth()
  );
}

function readPaginationTotalPages(pagination: unknown) {
  if (!pagination || typeof pagination !== "object") {
    return 1;
  }

  const paginationRecord = pagination as Record<string, unknown>;

  const totalPages =
    Number(paginationRecord.totalPages) ||
    Number(paginationRecord.pages) ||
    Number(paginationRecord.total_pages) ||
    1;

  return totalPages > 0 ? totalPages : 1;
}

function CalendarStatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-slate-200 bg-white px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

export default function ReservationsCalendarModal({
  open,
  onClose,
  onOpenDetail,
}: ReservationsCalendarModalProps) {
  const todayKey = toDateKey(new Date());

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const calendarDays = useMemo(
    () => buildCalendarDays(currentDate),
    [currentDate]
  );

  const rangeFrom = calendarDays[0] ? toDateKey(calendarDays[0]) : "";
  const rangeTo = calendarDays[calendarDays.length - 1]
    ? toDateKey(calendarDays[calendarDays.length - 1])
    : "";

  const loadCalendarReservations = useCallback(async (from: string, to: string) => {
    const allReservations: ApiReservation[] = [];

    for (let page = 1; page <= CALENDAR_MAX_PAGES; page += 1) {
      const filters: AdminReservationListParams = {
        page,
        limit: CALENDAR_PAGE_SIZE,
        from,
        to,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const result = await getAdminReservations(filters);
      const pageReservations = result.data || [];

      allReservations.push(...pageReservations);

      const totalPages = readPaginationTotalPages(result.pagination);

      if (page >= totalPages || pageReservations.length < CALENDAR_PAGE_SIZE) {
        break;
      }
    }

    return allReservations;
  }, []);

  const reservationsByDate = useMemo(() => {
    const grouped: Record<string, ApiReservation[]> = {};

    reservations.forEach((reservation) => {
      const dateKey = getReservationDateKey(reservation as ReservationRecord);

      if (!dateKey) return;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(reservation);
    });

    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort((a, b) => {
        const aTime = getReservationTime(a as ReservationRecord);
        const bTime = getReservationTime(b as ReservationRecord);

        return aTime.localeCompare(bTime);
      });
    });

    return grouped;
  }, [reservations]);

  const selectedDayReservations = reservationsByDate[selectedDateKey] || [];

  const paidReservations = useMemo(() => {
    return reservations.filter((reservation) => reservation.status === "PAID");
  }, [reservations]);

  const processingReservations = useMemo(() => {
    return reservations.filter(
      (reservation) => reservation.status === "PROCESSING_PAYMENT"
    );
  }, [reservations]);

  const draftReservations = useMemo(() => {
    return reservations.filter((reservation) => reservation.status === "DRAFT");
  }, [reservations]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !rangeFrom || !rangeTo) return;

    let ignore = false;

    async function fetchCalendarReservations() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await loadCalendarReservations(rangeFrom, rangeTo);

        if (!ignore) {
          setReservations(result);
        }
      } catch (error) {
        if (!ignore) {
          setReservations([]);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las reservaciones del calendario."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchCalendarReservations();

    return () => {
      ignore = true;
    };
  }, [open, rangeFrom, rangeTo, loadCalendarReservations]);

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => {
      const nextDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      setSelectedDateKey(toDateKey(nextDate));
      return nextDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const nextDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      setSelectedDateKey(toDateKey(nextDate));
      return nextDate;
    });
  };

  const handleToday = () => {
    const today = new Date();

    setCurrentDate(today);
    setSelectedDateKey(toDateKey(today));
  };

  const handleOpenDetail = (reservation: ApiReservation) => {
    onOpenDetail(reservation);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 px-3 py-4 backdrop-blur-sm sm:px-5">
      <div className="mx-auto flex h-full max-w-[1500px] flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Calendario
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Reservaciones por fecha
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-300">
                Consulta tus reservaciones por mes y abre el detalle sin salir
                del módulo administrativo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToday}
                className="border border-white/15 bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-slate-100"
              >
                Hoy
              </button>

              <button
                type="button"
                onClick={handlePreviousMonth}
                className="border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
              >
                Anterior
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
              >
                Siguiente
              </button>

              <button
                type="button"
                onClick={onClose}
                className="border border-red-300 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="grid gap-3 md:grid-cols-4">
            <CalendarStatCard label="Cargadas" value={reservations.length} />
            <CalendarStatCard label="Pagadas" value={paidReservations.length} />
            <CalendarStatCard
              label="Procesando"
              value={processingReservations.length}
            />
            <CalendarStatCard label="Borrador" value={draftReservations.length} />
          </div>

          {errorMessage && (
            <div className="mt-3 border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading && (
            <div className="mt-3 border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
              Cargando reservaciones del calendario...
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4">
          <div className="grid min-h-full gap-4 xl:grid-cols-[1fr_360px]">
            <div className="border border-slate-200 bg-white">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Vista mensual
                  </p>

                  <h3 className="text-2xl font-black text-slate-950">
                    {formatMonthTitle(currentDate)}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_STYLES).map(([status, style]) => (
                    <div
                      key={status}
                      className={`flex items-center gap-2 border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide ${style.badgeClass}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${style.dotClass}`} />
                      {getSafeStatusLabel(status)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {WEEK_DAYS.map((day) => (
                  <div
                    key={day}
                    className="border-r border-slate-200 px-3 py-2 text-center text-[11px] font-black uppercase tracking-wide text-slate-500 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((day) => {
                  const dateKey = toDateKey(day);
                  const dayReservations = reservationsByDate[dateKey] || [];
                  const visibleReservations = dayReservations.slice(0, 3);
                  const extraReservations = dayReservations.length - 3;
                  const outsideMonth = !isSameMonth(day, currentDate);
                  const isToday = dateKey === todayKey;
                  const isSelected = dateKey === selectedDateKey;

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => setSelectedDateKey(dateKey)}
                      className={[
                        "min-h-[150px] border-b border-r border-slate-200 p-2 text-left align-top transition hover:bg-slate-50",
                        outsideMonth
                          ? "bg-slate-50/80 text-slate-400"
                          : "bg-white text-slate-900",
                        isSelected ? "ring-2 ring-inset ring-slate-950" : "",
                      ].join(" ")}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span
                          className={[
                            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black",
                            isToday ? "bg-blue-600 text-white" : "",
                            !isToday && outsideMonth ? "text-slate-400" : "",
                            !isToday && !outsideMonth ? "text-slate-900" : "",
                          ].join(" ")}
                        >
                          {day.getDate()}
                        </span>

                        {dayReservations.length > 0 && (
                          <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-black text-white">
                            {dayReservations.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {visibleReservations.map((reservation, index) => {
                          const record = reservation as ReservationRecord;
                          const folio = getReservationFolio(record);
                          const time = getReservationTime(record);
                          const status = String(reservation.status || "DRAFT");
                          const style = getStatusStyle(status);

                          return (
                            <div
                              key={`${dateKey}-${folio || index}`}
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenDetail(reservation);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.stopPropagation();
                                  handleOpenDetail(reservation);
                                }
                              }}
                              className={`w-full cursor-pointer overflow-hidden border-l-4 px-2 py-1 text-left text-[11px] font-black transition ${style.eventClass}`}
                            >
                              <div className="truncate">
                                {time ? `${time} ` : ""}
                                {folio || "Reserva"}
                              </div>
                            </div>
                          );
                        })}

                        {extraReservations > 0 && (
                          <div className="text-[11px] font-black text-slate-500">
                            +{extraReservations} más
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-950 px-4 py-4 text-white">
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Agenda del día
                </p>

                <h3 className="mt-1 text-lg font-black">
                  {formatLongDate(selectedDateKey)}
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-300">
                  {selectedDayReservations.length} reservación(es)
                </p>
              </div>

              <div className="max-h-[720px] space-y-3 overflow-auto p-4">
                {selectedDayReservations.length === 0 && (
                  <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                    <p className="text-sm font-black text-slate-700">
                      No hay reservaciones en este día.
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Selecciona otra fecha del calendario.
                    </p>
                  </div>
                )}

                {selectedDayReservations.map((reservation, index) => {
                  const record = reservation as ReservationRecord;
                  const folio = getReservationFolio(record);
                  const time = getReservationTime(record);
                  const customerName = getCustomerName(record);
                  const packageCode = getPackageCode(record);
                  const total = getReservationTotal(record);
                  const status = String(reservation.status || "DRAFT");
                  const style = getStatusStyle(status);

                  return (
                    <article
                      key={`${selectedDateKey}-${folio || index}`}
                      className="border border-slate-200 bg-white shadow-sm"
                    >
                      <div className={`border-l-4 p-4 ${style.eventClass}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-950">
                              {folio || "Reservación"}
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-600">
                              {time || "Sin horario"} · {customerName}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${style.badgeClass}`}
                          >
                            {getSafeStatusLabel(status)}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600">
                          <div className="flex justify-between gap-3">
                            <span>Paquete</span>
                            <span className="text-right text-slate-950">
                              {packageCode || "N/D"}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span>Total</span>
                            <span className="text-right text-slate-950">
                              {formatMoneyFromCents(total)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenDetail(reservation)}
                          className="mt-4 w-full bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
                        >
                          Abrir detalle
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { formatMoneyFromCents } from "@/features/admin/reservations/utils/reservation-formatters";
import { fetchAllAdminReservations } from "@/features/admin/reports/services/admin-reports.service";
import {
  mapReservationToReportRow,
  type ReservationReportRow,
} from "@/features/admin/reports/utils/reservations-report";

import ChannelStackChart from "./charts/ChannelStackChart";
import DailyFlowChart from "./charts/DailyFlowChart";
import MonthlyCandleChart from "./charts/MonthlyCandleChart";
import WeekdayProfileChart from "./charts/WeekdayProfileChart";
import { DeltaBadge, MetricCard } from "./MetricCard";
import {
  MONTH_LABELS,
  addDaysISO,
  buildChannelMonthlySeries,
  buildChannelStats,
  buildDailySeries,
  buildMonthlyCandles,
  buildPeriodTotals,
  buildWeekdayProfile,
  computeDelta,
  daysBetweenInclusive,
  endOfMonthISO,
  filterPaidRows,
  filterRowsByRange,
  formatDecimal,
  formatInteger,
  formatShare,
  getAvailableYears,
  startOfMonthISO,
  todayISO,
  type ChannelStats,
} from "../utils/metrics-data";

type DailyRangeKey = "month" | "last90" | "year";

const CHANNEL_PALETTE = [
  "#0ea5e9",
  "#f97316",
  "#8b5cf6",
  "#10b981",
  "#ec4899",
  "#eab308",
  "#14b8a6",
  "#64748b",
];

const TOP_CHANNELS = 7;

const selectClass =
  "h-10 border border-white/15 bg-white/10 px-3 text-sm font-bold text-white outline-none transition focus:border-sky-400 [&>option]:text-slate-900";

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  tone = "light",
}: {
  value: T;
  options: { key: T; label: string }[];
  onChange: (key: T) => void;
  tone?: "light" | "dark";
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => {
        const isActive = option.key === value;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={[
              "border px-3 py-1.5 text-xs font-black transition",
              isActive
                ? tone === "dark"
                  ? "border-white bg-white text-slate-950"
                  : "border-slate-950 bg-slate-950 text-white"
                : tone === "dark"
                  ? "border-white/20 bg-white/5 text-slate-300 hover:bg-white/10"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  actions,
  children,
  tone = "light",
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <section
      className={[
        "border",
        isDark ? "border-slate-800 bg-slate-950" : "border-slate-300 bg-white",
      ].join(" ")}
    >
      <div
        className={[
          "flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
          isDark
            ? "border-slate-800 bg-slate-900"
            : "border-slate-300 bg-slate-100",
        ].join(" ")}
      >
        <div>
          <h2
            className={[
              "text-lg font-black",
              isDark ? "text-white" : "text-slate-950",
            ].join(" ")}
          >
            {title}
          </h2>

          {subtitle ? (
            <p
              className={[
                "mt-1 text-sm font-medium",
                isDark ? "text-slate-400" : "text-slate-500",
              ].join(" ")}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {children}
    </section>
  );
}

export default function MetricsView() {
  const today = todayISO();
  const currentYear = Number(today.slice(0, 4));
  const currentMonth = Number(today.slice(5, 7)) - 1;

  const [rows, setRows] = useState<ReservationReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [expectedCount, setExpectedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [year, setYear] = useState(currentYear);
  const [monthIndex, setMonthIndex] = useState(currentMonth);
  const [compareMode, setCompareMode] = useState<"mtd" | "full">("mtd");
  const [volumeMetric, setVolumeMetric] = useState<"revenue" | "reservations">(
    "revenue"
  );
  const [dailyRange, setDailyRange] = useState<DailyRangeKey>("last90");
  const [dailyMetric, setDailyMetric] = useState<"pax" | "revenue">("pax");
  const [channelMetric, setChannelMetric] = useState<
    "pax" | "revenue" | "reservations"
  >("pax");

  const didAutoRun = useRef(false);

  const loadMetrics = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setLoadedCount(0);
    setExpectedCount(0);

    try {
      // Se descarga todo el histórico una sola vez: así se puede cambiar de
      // año, mes o canal sin volver a pegarle a la API.
      const result = await fetchAllAdminReservations(
        {
          sortBy: "visitDate",
          sortOrder: "asc",
        },
        {
          onProgress: (loaded, total) => {
            setLoadedCount(loaded);
            setExpectedCount(total);
          },
        }
      );

      setRows(result.data.map(mapReservationToReportRow));
    } catch (error) {
      setRows([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las métricas."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (didAutoRun.current) return;

    didAutoRun.current = true;

    loadMetrics();
  }, []);

  const paidRows = useMemo(() => filterPaidRows(rows), [rows]);

  const availableYears = useMemo(() => getAvailableYears(rows), [rows]);

  const period = useMemo(() => {
    const from = startOfMonthISO(year, monthIndex);
    const naturalTo = endOfMonthISO(year, monthIndex);

    const isCurrentMonth = from <= today && today <= naturalTo;
    const useMtd = compareMode === "mtd" && isCurrentMonth;

    const to = useMtd ? today : naturalTo;

    const elapsedDays = daysBetweenInclusive(from, to);
    const monthDays = daysBetweenInclusive(from, naturalTo);

    const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;

    const prevFrom = startOfMonthISO(prevYear, prevMonth);
    const prevNaturalTo = endOfMonthISO(prevYear, prevMonth);

    const prevCandidate = addDaysISO(prevFrom, elapsedDays - 1);
    const prevTo = useMtd
      ? prevCandidate < prevNaturalTo
        ? prevCandidate
        : prevNaturalTo
      : prevNaturalTo;

    const lastYearFrom = startOfMonthISO(year - 1, monthIndex);
    const lastYearNaturalTo = endOfMonthISO(year - 1, monthIndex);

    const lastYearCandidate = addDaysISO(lastYearFrom, elapsedDays - 1);
    const lastYearTo = useMtd
      ? lastYearCandidate < lastYearNaturalTo
        ? lastYearCandidate
        : lastYearNaturalTo
      : lastYearNaturalTo;

    return {
      from,
      to,
      naturalTo,
      monthDays,
      elapsedDays,
      isCurrentMonth,
      useMtd,
      prevFrom,
      prevTo,
      prevLabel: `${MONTH_LABELS[prevMonth]} ${prevYear}`,
      lastYearFrom,
      lastYearTo,
      lastYearLabel: `${MONTH_LABELS[monthIndex]} ${year - 1}`,
      label: `${MONTH_LABELS[monthIndex]} ${year}`,
    };
  }, [year, monthIndex, compareMode, today]);

  const current = useMemo(
    () => buildPeriodTotals(paidRows, period.from, period.to),
    [paidRows, period]
  );

  const previous = useMemo(
    () => buildPeriodTotals(paidRows, period.prevFrom, period.prevTo),
    [paidRows, period]
  );

  const lastYear = useMemo(
    () => buildPeriodTotals(paidRows, period.lastYearFrom, period.lastYearTo),
    [paidRows, period]
  );

  const currentAttempts = useMemo(
    () => filterRowsByRange(rows, period.from, period.to).length,
    [rows, period]
  );

  const previousAttempts = useMemo(
    () => filterRowsByRange(rows, period.prevFrom, period.prevTo).length,
    [rows, period]
  );

  const deltas = useMemo(
    () => ({
      paxPerDay: computeDelta(current.paxPerDay, previous.paxPerDay),
      pax: computeDelta(current.pax, previous.pax),
      revenue: computeDelta(current.revenue, previous.revenue),
      revenuePerDay: computeDelta(current.revenuePerDay, previous.revenuePerDay),
      reservations: computeDelta(current.reservations, previous.reservations),
      ticket: computeDelta(
        current.ticketPerReservation,
        previous.ticketPerReservation
      ),
      revenuePerPax: computeDelta(current.revenuePerPax, previous.revenuePerPax),
      paxPerReservation: computeDelta(
        current.paxPerReservation,
        previous.paxPerReservation
      ),
      activeDays: computeDelta(current.activeDays, previous.activeDays),
      closeRate: computeDelta(
        currentAttempts > 0 ? current.reservations / currentAttempts : 0,
        previousAttempts > 0 ? previous.reservations / previousAttempts : 0
      ),
      yearPaxPerDay: computeDelta(current.paxPerDay, lastYear.paxPerDay),
      yearRevenue: computeDelta(current.revenue, lastYear.revenue),
    }),
    [current, previous, lastYear, currentAttempts, previousAttempts]
  );

  const candles = useMemo(
    () =>
      buildMonthlyCandles(
        paidRows,
        year,
        year === currentYear ? today : undefined
      ),
    [paidRows, year, currentYear, today]
  );

  const dailyRangeBounds = useMemo(() => {
    if (dailyRange === "month") {
      return {
        from: period.from,
        to: period.isCurrentMonth ? today : period.naturalTo,
        label: period.label,
      };
    }

    if (dailyRange === "last90") {
      return {
        from: addDaysISO(today, -89),
        to: today,
        label: "Últimos 90 días",
      };
    }

    return {
      from: `${year}-01-01`,
      to: year === currentYear ? today : `${year}-12-31`,
      label: `Año ${year}`,
    };
  }, [dailyRange, period, today, year, currentYear]);

  const dailySeries = useMemo(
    () =>
      buildDailySeries(
        filterRowsByRange(paidRows, dailyRangeBounds.from, dailyRangeBounds.to),
        dailyRangeBounds.from,
        dailyRangeBounds.to
      ),
    [paidRows, dailyRangeBounds]
  );

  const weekdayProfile = useMemo(
    () => buildWeekdayProfile(dailySeries),
    [dailySeries]
  );

  const channelStats = useMemo(
    () => buildChannelStats(paidRows, rows, period.from, period.to),
    [paidRows, rows, period]
  );

  const previousChannelStats = useMemo(
    () => buildChannelStats(paidRows, rows, period.prevFrom, period.prevTo),
    [paidRows, rows, period]
  );

  const previousChannelMap = useMemo(() => {
    const map = new Map<string, ChannelStats>();

    previousChannelStats.forEach((entry) => map.set(entry.key, entry));

    return map;
  }, [previousChannelStats]);

  const yearChannels = useMemo(() => {
    const yearRows = filterRowsByRange(
      paidRows,
      `${year}-01-01`,
      `${year}-12-31`
    );

    const totals = new Map<string, number>();

    yearRows.forEach((row) => {
      totals.set(row.reference, (totals.get(row.reference) || 0) + row.totalPax);
    });

    const ranked = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key);

    const top = ranked.slice(0, TOP_CHANNELS);

    return ranked.length > TOP_CHANNELS ? [...top, "Otros"] : top;
  }, [paidRows, year]);

  const channelColors = useMemo(() => {
    const map: Record<string, string> = {};

    yearChannels.forEach((channel, index) => {
      map[channel] = CHANNEL_PALETTE[index % CHANNEL_PALETTE.length];
    });

    return map;
  }, [yearChannels]);

  const channelMonthly = useMemo(
    () => buildChannelMonthlySeries(paidRows, year, yearChannels, channelMetric),
    [paidRows, year, yearChannels, channelMetric]
  );

  const yearTotals = useMemo(
    () =>
      buildPeriodTotals(
        paidRows,
        `${year}-01-01`,
        year === currentYear ? today : `${year}-12-31`
      ),
    [paidRows, year, currentYear, today]
  );

  const insights = useMemo(() => {
    const list: { title: string; detail: string; tone: "up" | "down" | "flat" }[] =
      [];

    const projectedPax =
      period.isCurrentMonth && current.paxPerDay > 0
        ? current.paxPerDay * period.monthDays
        : null;

    if (projectedPax !== null) {
      const projectionDelta = computeDelta(projectedPax, previous.pax);

      list.push({
        title: `Proyección de cierre: ${formatInteger(Math.round(projectedPax))} pax`,
        detail: `Al ritmo de ${formatDecimal(current.paxPerDay, 1)} pax/día, ${period.label} cerraría ${projectionDelta.direction === "up" ? "arriba" : "abajo"} de ${period.prevLabel} (${formatInteger(previous.pax)} pax).`,
        tone: projectionDelta.direction,
      });
    }

    const growing = channelStats
      .map((channel) => {
        const before = previousChannelMap.get(channel.key);

        return {
          channel,
          delta: computeDelta(channel.pax, before?.pax || 0),
        };
      })
      .filter((entry) => entry.channel.pax > 0)
      .sort((a, b) => b.delta.abs - a.delta.abs);

    if (growing.length > 0) {
      const best = growing[0];

      list.push({
        title: `${best.channel.key} es el canal que más movió la aguja`,
        detail: `${formatInteger(best.channel.pax)} pax (${formatShare(best.channel.paxShare, 0)} del total) y ${best.delta.abs >= 0 ? "+" : ""}${formatInteger(best.delta.abs)} pax contra ${period.prevLabel}.`,
        tone: best.delta.direction,
      });

      const falling = growing[growing.length - 1];

      if (falling.delta.direction === "down" && falling.channel.key !== best.channel.key) {
        list.push({
          title: `${falling.channel.key} viene cayendo`,
          detail: `Perdió ${formatInteger(Math.abs(falling.delta.abs))} pax contra ${period.prevLabel}. Vale revisar campañas o presencia en ese canal.`,
          tone: "down",
        });
      }
    }

    const closers = channelStats
      .filter((channel) => channel.attempts >= 3)
      .sort((a, b) => b.closeRate - a.closeRate);

    if (closers.length > 0) {
      list.push({
        title: `${closers[0].key} es el que mejor cierra`,
        detail: `${formatShare(closers[0].closeRate, 0)} de sus reservaciones terminan pagadas (${formatInteger(closers[0].reservations)} de ${formatInteger(closers[0].attempts)}). Meter presupuesto aquí rinde más.`,
        tone: "up",
      });
    }

    const bestWeekday = weekdayProfile.reduce(
      (top, point) => (point.paxPerDay > (top?.paxPerDay || 0) ? point : top),
      weekdayProfile[0]
    );

    const worstWeekday = weekdayProfile
      .filter((point) => point.days > 0)
      .reduce(
        (low, point) => (point.paxPerDay < low.paxPerDay ? point : low),
        weekdayProfile[0]
      );

    if (bestWeekday && bestWeekday.paxPerDay > 0) {
      list.push({
        title: `Los ${bestWeekday.label.toLowerCase()} son el mejor día`,
        detail: `Promedian ${formatDecimal(bestWeekday.paxPerDay, 1)} pax/día en ${dailyRangeBounds.label.toLowerCase()}, contra ${formatDecimal(worstWeekday?.paxPerDay || 0, 1)} de los ${worstWeekday?.label.toLowerCase()}. Ahí está el hueco que se puede llenar con promoción.`,
        tone: "flat",
      });
    }

    const bestMonth = candles
      .filter((candle) => candle.hasData)
      .sort((a, b) => b.paxPerDay - a.paxPerDay)[0];

    if (bestMonth) {
      list.push({
        title: `${bestMonth.label} es el mes más fuerte de ${year}`,
        detail: `${formatDecimal(bestMonth.paxPerDay, 1)} pax/día y ${formatMoneyFromCents(bestMonth.revenue)} de ingreso pagado.`,
        tone: "flat",
      });
    }

    return list;
  }, [
    period,
    current,
    previous,
    channelStats,
    previousChannelMap,
    weekdayProfile,
    dailyRangeBounds,
    candles,
    year,
  ]);

  const comparisonRows = [
    {
      label: "Pax promedio por día",
      current: formatDecimal(current.paxPerDay, 2),
      previous: formatDecimal(previous.paxPerDay, 2),
      lastYear: formatDecimal(lastYear.paxPerDay, 2),
      delta: deltas.paxPerDay,
      highlight: true,
    },
    {
      label: "Pax que pagaron",
      current: formatInteger(current.pax),
      previous: formatInteger(previous.pax),
      lastYear: formatInteger(lastYear.pax),
      delta: deltas.pax,
    },
    {
      label: "Reservaciones pagadas",
      current: formatInteger(current.reservations),
      previous: formatInteger(previous.reservations),
      lastYear: formatInteger(lastYear.reservations),
      delta: deltas.reservations,
    },
    {
      label: "Ingreso pagado",
      current: formatMoneyFromCents(current.revenue),
      previous: formatMoneyFromCents(previous.revenue),
      lastYear: formatMoneyFromCents(lastYear.revenue),
      delta: deltas.revenue,
    },
    {
      label: "Ingreso por día",
      current: formatMoneyFromCents(current.revenuePerDay),
      previous: formatMoneyFromCents(previous.revenuePerDay),
      lastYear: formatMoneyFromCents(lastYear.revenuePerDay),
      delta: deltas.revenuePerDay,
    },
    {
      label: "Ticket por reservación",
      current: formatMoneyFromCents(current.ticketPerReservation),
      previous: formatMoneyFromCents(previous.ticketPerReservation),
      lastYear: formatMoneyFromCents(lastYear.ticketPerReservation),
      delta: deltas.ticket,
    },
    {
      label: "Ingreso por pax",
      current: formatMoneyFromCents(current.revenuePerPax),
      previous: formatMoneyFromCents(previous.revenuePerPax),
      lastYear: formatMoneyFromCents(lastYear.revenuePerPax),
      delta: deltas.revenuePerPax,
    },
    {
      label: "Pax por reservación",
      current: formatDecimal(current.paxPerReservation, 2),
      previous: formatDecimal(previous.paxPerReservation, 2),
      lastYear: formatDecimal(lastYear.paxPerReservation, 2),
      delta: deltas.paxPerReservation,
    },
    {
      label: "Días con visitas",
      current: `${formatInteger(current.activeDays)} / ${formatInteger(current.days)}`,
      previous: `${formatInteger(previous.activeDays)} / ${formatInteger(previous.days)}`,
      lastYear: `${formatInteger(lastYear.activeDays)} / ${formatInteger(lastYear.days)}`,
      delta: deltas.activeDays,
    },
    {
      label: "Tasa de cierre",
      current: formatShare(
        currentAttempts > 0 ? current.reservations / currentAttempts : 0
      ),
      previous: formatShare(
        previousAttempts > 0 ? previous.reservations / previousAttempts : 0
      ),
      lastYear: "—",
      delta: deltas.closeRate,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Crecimiento
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Métricas de pax y canales
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-300">
                Pax que realmente pagó, promedio por día, comparativa contra el
                mes anterior y la escala del año completo en formato de trading.
                Todo sale de reservaciones en estado Pagada y Completada.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <select
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className={selectClass}
                  aria-label="Año"
                >
                  {availableYears.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={monthIndex}
                  onChange={(event) => setMonthIndex(Number(event.target.value))}
                  className={selectClass}
                  aria-label="Mes"
                >
                  {MONTH_LABELS.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>

                <SegmentedControl
                  tone="dark"
                  value={compareMode}
                  onChange={setCompareMode}
                  options={[
                    { key: "mtd", label: "Mismo periodo" },
                    { key: "full", label: "Mes completo" },
                  ]}
                />

                <button
                  type="button"
                  onClick={loadMetrics}
                  disabled={isLoading}
                  className="h-10 border border-white/20 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading
                    ? `Cargando${expectedCount ? ` ${loadedCount}/${expectedCount}` : ""}...`
                    : "Actualizar"}
                </button>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-2 xl:max-w-2xl">
              <MetricCard
                tone="dark"
                accent
                label="Pax promedio por día"
                value={formatDecimal(current.paxPerDay, 2)}
                delta={deltas.paxPerDay}
                deltaSuffix={`vs ${period.prevLabel}`}
                hint={`${formatInteger(current.pax)} pax en ${formatInteger(current.days)} días`}
              />

              <MetricCard
                tone="dark"
                label="Ingreso pagado"
                value={formatMoneyFromCents(current.revenue)}
                delta={deltas.revenue}
                deltaSuffix={`vs ${period.prevLabel}`}
              />

              <MetricCard
                tone="dark"
                label="Pax en días con visita"
                value={formatDecimal(current.paxPerActiveDay, 2)}
                hint={`${formatInteger(current.activeDays)} días con entradas`}
              />

              <MetricCard
                tone="dark"
                label="Ticket por reservación"
                value={formatMoneyFromCents(current.ticketPerReservation)}
                delta={deltas.ticket}
                deltaSuffix={`vs ${period.prevLabel}`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600">
          <span>
            Periodo:{" "}
            <span className="text-slate-950">
              {period.from} → {period.to}
            </span>
          </span>

          <span>
            Comparado contra:{" "}
            <span className="text-slate-950">
              {period.prevFrom} → {period.prevTo}
            </span>
          </span>

          <span>
            {period.useMtd
              ? "Se comparan los mismos días de cada mes para que la lectura sea justa."
              : "Se comparan los meses completos."}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading && rows.length === 0 && (
        <div className="border border-slate-300 bg-white px-4 py-14 text-center">
          <p className="text-base font-black text-slate-800">
            Cargando histórico de reservaciones...
          </p>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {expectedCount
              ? `${loadedCount} de ${expectedCount} reservaciones`
              : "Preparando la consulta"}
          </p>
        </div>
      )}

      <SectionCard
        title={`${period.label} contra ${period.prevLabel}`}
        subtitle={`Y de referencia, el mismo periodo de ${period.lastYearLabel}.`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="border-b border-slate-300 bg-slate-200">
              <tr>
                <th className="border-r border-slate-300 px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Métrica
                </th>

                <th className="border-r border-slate-300 px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-700">
                  {period.label}
                </th>

                <th className="border-r border-slate-300 px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-700">
                  {period.prevLabel}
                </th>

                <th className="border-r border-slate-300 px-4 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Variación
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-700">
                  {period.lastYearLabel}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {comparisonRows.map((row) => (
                <tr
                  key={row.label}
                  className={row.highlight ? "bg-sky-50/70" : "bg-white"}
                >
                  <td className="border-r border-slate-200 px-4 py-3 text-sm font-black text-slate-900">
                    {row.label}
                  </td>

                  <td className="border-r border-slate-200 px-4 py-3 text-right text-sm font-black text-slate-950">
                    {row.current}
                  </td>

                  <td className="border-r border-slate-200 px-4 py-3 text-right text-sm font-bold text-slate-600">
                    {row.previous}
                  </td>

                  <td className="border-r border-slate-200 px-4 py-3 text-center">
                    <DeltaBadge delta={row.delta} />
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-500">
                    {row.lastYear}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        tone="dark"
        title={`Escala anual ${year} · velas mensuales`}
        subtitle={`${formatInteger(yearTotals.pax)} pax · ${formatMoneyFromCents(yearTotals.revenue)} · ${formatDecimal(yearTotals.paxPerDay, 2)} pax/día en el año`}
        actions={
          <SegmentedControl
            tone="dark"
            value={volumeMetric}
            onChange={setVolumeMetric}
            options={[
              { key: "revenue", label: "Volumen: ingreso" },
              { key: "reservations", label: "Volumen: reservaciones" },
            ]}
          />
        }
      >
        <MonthlyCandleChart
          candles={candles}
          year={year}
          volumeMetric={volumeMetric}
        />
      </SectionCard>

      <SectionCard
        tone="dark"
        title="Flujo diario de visitantes"
        subtitle={`${dailyRangeBounds.label} · ${dailyRangeBounds.from} → ${dailyRangeBounds.to}`}
        actions={
          <>
            <SegmentedControl
              tone="dark"
              value={dailyRange}
              onChange={setDailyRange}
              options={[
                { key: "month", label: "Mes" },
                { key: "last90", label: "90 días" },
                { key: "year", label: "Año" },
              ]}
            />

            <SegmentedControl
              tone="dark"
              value={dailyMetric}
              onChange={setDailyMetric}
              options={[
                { key: "pax", label: "Pax" },
                { key: "revenue", label: "Ingreso" },
              ]}
            />
          </>
        }
      >
        <DailyFlowChart points={dailySeries} metric={dailyMetric} />
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="Promedio por día de la semana"
          subtitle={`Base: ${dailyRangeBounds.label.toLowerCase()}`}
        >
          <WeekdayProfileChart points={weekdayProfile} />
        </SectionCard>

        <SectionCard
          title="Lecturas para crecer"
          subtitle="Generadas con los datos del periodo seleccionado."
        >
          <div className="divide-y divide-slate-200">
            {insights.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm font-bold text-slate-500">
                Todavía no hay suficientes datos en el periodo.
              </p>
            ) : (
              insights.map((insight) => (
                <div key={insight.title} className="flex gap-3 px-4 py-3.5">
                  <span
                    className={[
                      "mt-1 h-2.5 w-2.5 shrink-0",
                      insight.tone === "up"
                        ? "bg-emerald-500"
                        : insight.tone === "down"
                          ? "bg-rose-500"
                          : "bg-slate-400",
                    ].join(" ")}
                  />

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {insight.title}
                    </p>

                    <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                      {insight.detail}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title={`De dónde llegan · ${year}`}
        subtitle="Aportación mensual por origen: aquí se ve si el crecimiento viene de directo, de redes o de socios."
        actions={
          <SegmentedControl
            value={channelMetric}
            onChange={setChannelMetric}
            options={[
              { key: "pax", label: "Pax" },
              { key: "revenue", label: "Ingreso" },
              { key: "reservations", label: "Reservaciones" },
            ]}
          />
        }
      >
        <div className="px-4 pb-2 pt-4">
          <div className="mb-3 flex flex-wrap gap-3">
            {yearChannels.map((channel) => (
              <span
                key={channel}
                className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-600"
              >
                <span
                  className="h-3 w-3"
                  style={{ backgroundColor: channelColors[channel] }}
                />
                {channel}
              </span>
            ))}
          </div>

          <ChannelStackChart
            points={channelMonthly}
            channels={yearChannels}
            colors={channelColors}
            metric={channelMetric}
          />
        </div>
      </SectionCard>

      <SectionCard
        title={`Ranking de orígenes · ${period.label}`}
        subtitle="Pax, ingreso, ticket y qué tan bien cierra cada canal contra el mes anterior."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="border-b border-slate-300 bg-slate-200">
              <tr>
                <th className="border-r border-slate-300 px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Origen
                </th>

                <th className="border-r border-slate-300 px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Pax
                </th>

                <th className="border-r border-slate-300 px-4 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Pax vs mes ant.
                </th>

                <th className="border-r border-slate-300 px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Pax / día
                </th>

                <th className="border-r border-slate-300 px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Ingreso
                </th>

                <th className="border-r border-slate-300 px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Ticket
                </th>

                <th className="border-r border-slate-300 px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Cierre
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Share pax
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {channelStats.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="bg-white px-4 py-12 text-center text-sm font-bold text-slate-500"
                  >
                    No hay reservaciones pagadas en {period.label}.
                  </td>
                </tr>
              ) : (
                channelStats.map((channel, index) => {
                  const before = previousChannelMap.get(channel.key);

                  const delta = computeDelta(channel.pax, before?.pax || 0);

                  return (
                    <tr
                      key={channel.key}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="border-r border-slate-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0"
                            style={{
                              backgroundColor:
                                channelColors[channel.key] || "#94a3b8",
                            }}
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900">
                              {channel.key}
                            </p>

                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              {channel.group}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="border-r border-slate-200 px-4 py-3 text-right text-sm font-black text-slate-950">
                        {formatInteger(channel.pax)}
                      </td>

                      <td className="border-r border-slate-200 px-4 py-3 text-center">
                        <DeltaBadge delta={delta} />
                      </td>

                      <td className="border-r border-slate-200 px-4 py-3 text-right text-sm font-bold text-slate-700">
                        {formatDecimal(channel.paxPerDay, 2)}
                      </td>

                      <td className="border-r border-slate-200 px-4 py-3 text-right text-sm font-black text-slate-950">
                        {formatMoneyFromCents(channel.revenue)}
                      </td>

                      <td className="border-r border-slate-200 px-4 py-3 text-right text-sm font-bold text-slate-700">
                        {formatMoneyFromCents(channel.ticket)}
                      </td>

                      <td className="border-r border-slate-200 px-4 py-3 text-right text-sm font-bold text-slate-700">
                        {formatShare(channel.closeRate, 0)}

                        <span className="ml-1 text-[11px] font-bold text-slate-400">
                          ({formatInteger(channel.reservations)}/
                          {formatInteger(channel.attempts)})
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-black text-slate-950">
                        {formatShare(channel.paxShare, 0)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-300 bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600">
          Cierre = reservaciones pagadas entre todas las que se crearon con ese
          origen en el periodo. Es la conversión real de cada canal.
        </div>
      </SectionCard>
    </div>
  );
}

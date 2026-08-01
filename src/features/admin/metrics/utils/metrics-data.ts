import type { ReservationReportRow } from "@/features/admin/reports/utils/reservations-report";

/**
 * Estados donde el dinero ya entró. Todo lo que mide "pax que pagó",
 * ingreso y ticket sale exclusivamente de estas reservaciones.
 */
export const PAID_STATUSES = ["PAID", "COMPLETED"];

export const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export type DailyPoint = {
  date: string;
  pax: number;
  reservations: number;
  revenue: number;
};

export type PeriodTotals = {
  from: string;
  to: string;
  /** Días de calendario del periodo (para el mes en curso, solo los transcurridos). */
  days: number;
  /** Días donde de verdad entró al menos un pax pagado. */
  activeDays: number;
  pax: number;
  reservations: number;
  revenue: number;
  paxPerDay: number;
  paxPerActiveDay: number;
  reservationsPerDay: number;
  revenuePerDay: number;
  ticketPerReservation: number;
  revenuePerPax: number;
  paxPerReservation: number;
};

export type MonthlyCandle = {
  key: string;
  year: number;
  month: number;
  label: string;
  /** OHLC del pax diario del mes: así se lee como una vela de trading. */
  open: number;
  high: number;
  low: number;
  close: number;
  pax: number;
  reservations: number;
  revenue: number;
  days: number;
  activeDays: number;
  paxPerDay: number;
  isUp: boolean;
  hasData: boolean;
};

export type ChannelStats = {
  key: string;
  group: string;
  pax: number;
  reservations: number;
  revenue: number;
  paxPerDay: number;
  paxShare: number;
  revenueShare: number;
  ticket: number;
  /** Reservaciones creadas en ese origen, sin importar si pagaron. */
  attempts: number;
  closeRate: number;
};

export type DeltaResult = {
  current: number;
  previous: number;
  abs: number;
  pct: number | null;
  direction: "up" | "down" | "flat";
};

/**
 * Agrupación comercial de los orígenes: sirve para responder rápido
 * "¿crecemos por redes, por directo o por socios?".
 */
const CHANNEL_GROUPS: Record<string, string> = {
  Facebook: "Redes sociales",
  Instagram: "Redes sociales",
  TikTok: "Redes sociales",
  WhatsApp: "Mensajería",
  Directo: "Directo",
  "Pagina WEB": "Directo",
  Google: "Buscadores",
  Agencias: "Socios",
  Taxis: "Socios",
  Hotel: "Socios",
};

export function getChannelGroup(reference: string) {
  return CHANNEL_GROUPS[reference] || "Otros";
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toISODate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayISO() {
  return toISODate(new Date());
}

/**
 * Aritmética de fechas en UTC para que sumar días nunca se mueva por
 * horario de verano: las fechas de visita son "YYYY-MM-DD" planas.
 */
export function addDaysISO(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const time = Date.UTC(year, month - 1, day) + days * 86400000;
  const date = new Date(time);

  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function daysBetweenInclusive(from: string, to: string) {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);

  const diff = Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd);

  return Math.floor(diff / 86400000) + 1;
}

export function getWeekdayIndex(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function startOfMonthISO(year: number, month: number) {
  return `${year}-${pad2(month + 1)}-01`;
}

export function endOfMonthISO(year: number, month: number) {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return `${year}-${pad2(month + 1)}-${pad2(lastDay)}`;
}

export function formatMonthKey(iso: string) {
  return iso.slice(0, 7);
}

export function isPaidRow(row: ReservationReportRow) {
  return PAID_STATUSES.includes(row.status);
}

export function filterPaidRows(rows: ReservationReportRow[]) {
  return rows.filter(isPaidRow);
}

export function filterRowsByRange(
  rows: ReservationReportRow[],
  from: string,
  to: string
) {
  return rows.filter(
    (row) => row.visitDate && row.visitDate >= from && row.visitDate <= to
  );
}

function safeDivide(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

/**
 * Serie diaria completa: los días sin visitas quedan en cero para que el
 * promedio por día no mienta y la gráfica no invente continuidad.
 */
export function buildDailySeries(
  rows: ReservationReportRow[],
  from: string,
  to: string
): DailyPoint[] {
  const points = new Map<string, DailyPoint>();

  const totalDays = daysBetweenInclusive(from, to);

  if (totalDays <= 0) return [];

  for (let index = 0; index < totalDays; index += 1) {
    const date = addDaysISO(from, index);

    points.set(date, { date, pax: 0, reservations: 0, revenue: 0 });
  }

  rows.forEach((row) => {
    const point = points.get(row.visitDate);

    if (!point) return;

    point.pax += row.totalPax;
    point.reservations += 1;
    point.revenue += row.totalMXN;
  });

  return Array.from(points.values());
}

export function buildPeriodTotals(
  rows: ReservationReportRow[],
  from: string,
  to: string
): PeriodTotals {
  const scoped = filterRowsByRange(rows, from, to);

  const days = Math.max(daysBetweenInclusive(from, to), 0);

  const activeDates = new Set<string>();

  let pax = 0;
  let revenue = 0;

  scoped.forEach((row) => {
    pax += row.totalPax;
    revenue += row.totalMXN;

    if (row.totalPax > 0) {
      activeDates.add(row.visitDate);
    }
  });

  const reservations = scoped.length;
  const activeDays = activeDates.size;

  return {
    from,
    to,
    days,
    activeDays,
    pax,
    reservations,
    revenue,
    paxPerDay: safeDivide(pax, days),
    paxPerActiveDay: safeDivide(pax, activeDays),
    reservationsPerDay: safeDivide(reservations, days),
    revenuePerDay: safeDivide(revenue, days),
    ticketPerReservation: safeDivide(revenue, reservations),
    revenuePerPax: safeDivide(revenue, pax),
    paxPerReservation: safeDivide(pax, reservations),
  };
}

/**
 * Vela mensual: abre con el pax del primer día con entradas del mes y
 * cierra con el del último. Los días muertos no se toman como mínimo
 * porque aplanarían todas las velas contra el piso.
 */
export function buildMonthlyCandles(
  rows: ReservationReportRow[],
  year: number,
  limitISO?: string
): MonthlyCandle[] {
  return MONTH_LABELS.map((label, month) => {
    const from = startOfMonthISO(year, month);
    const naturalTo = endOfMonthISO(year, month);
    const to = limitISO && limitISO < naturalTo ? limitISO : naturalTo;

    const key = `${year}-${pad2(month + 1)}`;

    if (limitISO && from > limitISO) {
      return {
        key,
        year,
        month,
        label,
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        pax: 0,
        reservations: 0,
        revenue: 0,
        days: 0,
        activeDays: 0,
        paxPerDay: 0,
        isUp: false,
        hasData: false,
      };
    }

    const daily = buildDailySeries(filterRowsByRange(rows, from, to), from, to);
    const totals = buildPeriodTotals(rows, from, to);

    const activePoints = daily.filter((point) => point.pax > 0);

    const open = activePoints.length > 0 ? activePoints[0].pax : 0;
    const close =
      activePoints.length > 0 ? activePoints[activePoints.length - 1].pax : 0;

    const high = activePoints.reduce(
      (max, point) => Math.max(max, point.pax),
      0
    );

    const low = activePoints.reduce(
      (min, point) => Math.min(min, point.pax),
      activePoints.length > 0 ? activePoints[0].pax : 0
    );

    return {
      key,
      year,
      month,
      label,
      open,
      high,
      low,
      close,
      pax: totals.pax,
      reservations: totals.reservations,
      revenue: totals.revenue,
      days: totals.days,
      activeDays: totals.activeDays,
      paxPerDay: totals.paxPerDay,
      isUp: close >= open,
      hasData: activePoints.length > 0,
    };
  });
}

/** Media móvil simple; devuelve null donde todavía no hay ventana completa. */
export function movingAverage(values: number[], window: number) {
  return values.map((_, index) => {
    if (index + 1 < window) return null;

    const slice = values.slice(index + 1 - window, index + 1);
    const sum = slice.reduce((acc, value) => acc + value, 0);

    return sum / window;
  });
}

export function buildChannelStats(
  paidRows: ReservationReportRow[],
  allRows: ReservationReportRow[],
  from: string,
  to: string
): ChannelStats[] {
  const scopedPaid = filterRowsByRange(paidRows, from, to);
  const scopedAll = filterRowsByRange(allRows, from, to);

  const days = Math.max(daysBetweenInclusive(from, to), 1);

  const totalPax = scopedPaid.reduce((acc, row) => acc + row.totalPax, 0);
  const totalRevenue = scopedPaid.reduce((acc, row) => acc + row.totalMXN, 0);

  const attempts = new Map<string, number>();

  scopedAll.forEach((row) => {
    attempts.set(row.reference, (attempts.get(row.reference) || 0) + 1);
  });

  const map = new Map<
    string,
    { pax: number; reservations: number; revenue: number }
  >();

  scopedPaid.forEach((row) => {
    const entry = map.get(row.reference) || {
      pax: 0,
      reservations: 0,
      revenue: 0,
    };

    map.set(row.reference, {
      pax: entry.pax + row.totalPax,
      reservations: entry.reservations + 1,
      revenue: entry.revenue + row.totalMXN,
    });
  });

  // Un origen puede tener intentos sin ninguna reservación pagada: también
  // interesa verlo, porque es tráfico que llega y no cierra.
  attempts.forEach((_, reference) => {
    if (!map.has(reference)) {
      map.set(reference, { pax: 0, reservations: 0, revenue: 0 });
    }
  });

  return Array.from(map.entries())
    .map(([key, entry]) => {
      const channelAttempts = attempts.get(key) || entry.reservations;

      return {
        key,
        group: getChannelGroup(key),
        pax: entry.pax,
        reservations: entry.reservations,
        revenue: entry.revenue,
        paxPerDay: safeDivide(entry.pax, days),
        paxShare: safeDivide(entry.pax, totalPax),
        revenueShare: safeDivide(entry.revenue, totalRevenue),
        ticket: safeDivide(entry.revenue, entry.reservations),
        attempts: channelAttempts,
        closeRate: safeDivide(entry.reservations, channelAttempts),
      };
    })
    .sort((a, b) => b.revenue - a.revenue || b.pax - a.pax);
}

export type ChannelMonthlyPoint = {
  key: string;
  label: string;
  total: number;
  values: Record<string, number>;
};

export function buildChannelMonthlySeries(
  paidRows: ReservationReportRow[],
  year: number,
  channels: string[],
  metric: "pax" | "revenue" | "reservations" = "pax"
): ChannelMonthlyPoint[] {
  return MONTH_LABELS.map((label, month) => {
    const from = startOfMonthISO(year, month);
    const to = endOfMonthISO(year, month);

    const scoped = filterRowsByRange(paidRows, from, to);

    const values: Record<string, number> = {};

    channels.forEach((channel) => {
      values[channel] = 0;
    });

    let total = 0;

    scoped.forEach((row) => {
      const bucket = channels.includes(row.reference) ? row.reference : "Otros";

      const amount =
        metric === "pax"
          ? row.totalPax
          : metric === "revenue"
            ? row.totalMXN
            : 1;

      values[bucket] = (values[bucket] || 0) + amount;
      total += amount;
    });

    return { key: `${year}-${pad2(month + 1)}`, label, total, values };
  });
}

export type WeekdayPoint = {
  index: number;
  label: string;
  days: number;
  pax: number;
  revenue: number;
  paxPerDay: number;
};

export function buildWeekdayProfile(daily: DailyPoint[]): WeekdayPoint[] {
  const buckets = WEEKDAY_LABELS.map((label, index) => ({
    index,
    label,
    days: 0,
    pax: 0,
    revenue: 0,
    paxPerDay: 0,
  }));

  daily.forEach((point) => {
    const bucket = buckets[getWeekdayIndex(point.date)];

    bucket.days += 1;
    bucket.pax += point.pax;
    bucket.revenue += point.revenue;
  });

  buckets.forEach((bucket) => {
    bucket.paxPerDay = safeDivide(bucket.pax, bucket.days);
  });

  return buckets;
}

export function computeDelta(current: number, previous: number): DeltaResult {
  const abs = current - previous;

  const pct = previous > 0 ? abs / previous : null;

  const direction: DeltaResult["direction"] =
    Math.abs(abs) < 0.0001 ? "flat" : abs > 0 ? "up" : "down";

  return { current, previous, abs, pct, direction };
}

export function formatDecimal(value: number, digits = 1) {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatInteger(value: number) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) return "—";

  return `${value > 0 ? "+" : ""}${formatDecimal(value * 100, digits)}%`;
}

export function formatShare(value: number, digits = 1) {
  if (!Number.isFinite(value)) return "0%";

  return `${formatDecimal(value * 100, digits)}%`;
}

export function formatCompactMoney(value: number) {
  const amount = Number.isFinite(value) ? value : 0;

  if (Math.abs(amount) >= 1000000) {
    return `$${formatDecimal(amount / 1000000, 1)}M`;
  }

  if (Math.abs(amount) >= 1000) {
    return `$${formatDecimal(amount / 1000, 1)}k`;
  }

  return `$${formatInteger(amount)}`;
}

export function formatDayLabel(iso: string) {
  if (!iso) return "";

  const [year, month, day] = iso.split("-").map(Number);

  return `${day} ${MONTH_LABELS[month - 1]} ${year}`;
}

export function getAvailableYears(rows: ReservationReportRow[]) {
  const years = new Set<number>();

  rows.forEach((row) => {
    if (!row.visitDate) return;

    years.add(Number(row.visitDate.slice(0, 4)));
  });

  const currentYear = new Date().getFullYear();

  years.add(currentYear);

  return Array.from(years)
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => b - a);
}

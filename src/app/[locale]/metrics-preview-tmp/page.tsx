"use client";

import { useMemo } from "react";

import ChannelStackChart from "@/features/admin/metrics/components/charts/ChannelStackChart";
import DailyFlowChart from "@/features/admin/metrics/components/charts/DailyFlowChart";
import MonthlyCandleChart from "@/features/admin/metrics/components/charts/MonthlyCandleChart";
import WeekdayProfileChart from "@/features/admin/metrics/components/charts/WeekdayProfileChart";
import {
  addDaysISO,
  buildChannelMonthlySeries,
  buildChannelStats,
  buildDailySeries,
  buildMonthlyCandles,
  buildPeriodTotals,
  buildWeekdayProfile,
  filterPaidRows,
  filterRowsByRange,
} from "@/features/admin/metrics/utils/metrics-data";
import type { ReservationReportRow } from "@/features/admin/reports/utils/reservations-report";

const REFS = ["Directo", "Google", "Facebook", "Instagram", "Hotel", "Taxis"];

function makeRows(): ReservationReportRow[] {
  const rows: ReservationReportRow[] = [];

  let seed = 42;

  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;

    return seed / 2147483648;
  };

  for (let index = 0; index < 600; index += 1) {
    const date = addDaysISO("2025-08-01", Math.floor(random() * 366));

    const pax = 1 + Math.floor(random() * 6);
    const paid = random() > 0.25;

    rows.push({
      folio: `F${index}`,
      status: paid ? "PAID" : "DRAFT",
      statusLabel: paid ? "Pagada" : "Borrador",
      visitDate: date,
      visitDateLabel: date,
      createdAt: date,
      customerName: "Test",
      email: "",
      phone: "",
      country: "",
      packageCode: "KX_BASIC",
      reference: REFS[Math.floor(random() * REFS.length)],
      campaign: "",
      coupon: "",
      adults: pax,
      children: 0,
      infants: 0,
      inapam: 0,
      totalPax: pax,
      subtotalMXN: pax * 650,
      extrasMXN: 0,
      discountMXN: 0,
      totalMXN: pax * 650,
      currency: "MXN",
      paymentMethod: "card",
      paymentStatus: "succeeded",
      paymentReference: "",
    });
  }

  return rows;
}

export default function MetricsPreviewPage() {
  const rows = useMemo(makeRows, []);
  const paid = useMemo(() => filterPaidRows(rows), [rows]);

  const candles = useMemo(() => buildMonthlyCandles(paid, 2026), [paid]);

  const daily = useMemo(
    () =>
      buildDailySeries(
        filterRowsByRange(paid, "2026-05-01", "2026-08-01"),
        "2026-05-01",
        "2026-08-01"
      ),
    [paid]
  );

  const weekday = useMemo(() => buildWeekdayProfile(daily), [daily]);

  const channels = useMemo(
    () => buildChannelMonthlySeries(paid, 2026, REFS, "pax"),
    [paid]
  );

  const stats = useMemo(
    () => buildChannelStats(paid, rows, "2026-07-01", "2026-07-31"),
    [paid, rows]
  );

  const totals = useMemo(
    () => buildPeriodTotals(paid, "2026-07-01", "2026-07-31"),
    [paid]
  );

  const colors: Record<string, string> = {
    Directo: "#0ea5e9",
    Google: "#f97316",
    Facebook: "#8b5cf6",
    Instagram: "#10b981",
    Hotel: "#ec4899",
    Taxis: "#eab308",
  };

  return (
    <div className="space-y-6 bg-slate-100 p-6">
      <pre className="bg-white p-4 text-xs">
        {JSON.stringify(
          {
            totals,
            firstChannel: stats[0],
            julyCandle: candles[6],
          },
          null,
          2
        )}
      </pre>

      <MonthlyCandleChart candles={candles} year={2026} volumeMetric="revenue" />

      <DailyFlowChart points={daily} metric="pax" />

      <div className="bg-white">
        <WeekdayProfileChart points={weekday} />
      </div>

      <div className="bg-white p-4">
        <ChannelStackChart
          points={channels}
          channels={REFS}
          colors={colors}
          metric="pax"
        />
      </div>
    </div>
  );
}

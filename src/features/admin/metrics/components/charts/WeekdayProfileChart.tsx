"use client";

import {
  formatDecimal,
  formatInteger,
  type WeekdayPoint,
} from "../../utils/metrics-data";

type WeekdayProfileChartProps = {
  points: WeekdayPoint[];
};

/**
 * Promedio de pax por día de la semana: dice qué días conviene empujar
 * campañas y cuáles ya están llenos.
 */
export default function WeekdayProfileChart({
  points,
}: WeekdayProfileChartProps) {
  const max = Math.max(...points.map((point) => point.paxPerDay), 0.0001);

  const best = points.reduce(
    (top, point) => (point.paxPerDay > top.paxPerDay ? point : top),
    points[0]
  );

  return (
    <div className="divide-y divide-slate-200">
      {points.map((point) => {
        const width = (point.paxPerDay / max) * 100;

        const isBest = point.index === best?.index && point.paxPerDay > 0;

        return (
          <div key={point.index} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-10 shrink-0 text-xs font-black uppercase text-slate-500">
              {point.label}
            </span>

            <div className="h-6 flex-1 bg-slate-100">
              <div
                className={[
                  "h-6 transition-all",
                  isBest ? "bg-slate-950" : "bg-slate-400",
                ].join(" ")}
                style={{ width: `${Math.max(width, point.paxPerDay > 0 ? 2 : 0)}%` }}
              />
            </div>

            <span className="w-28 shrink-0 text-right text-xs font-black text-slate-900">
              {formatDecimal(point.paxPerDay, 1)} pax/día
            </span>

            <span className="hidden w-24 shrink-0 text-right text-[11px] font-bold text-slate-500 sm:block">
              {formatInteger(point.pax)} pax
            </span>
          </div>
        );
      })}
    </div>
  );
}

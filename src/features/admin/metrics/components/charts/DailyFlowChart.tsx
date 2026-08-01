"use client";

import { useMemo, useState, type MouseEvent } from "react";

import {
  formatCompactMoney,
  formatDayLabel,
  formatDecimal,
  formatInteger,
  movingAverage,
  type DailyPoint,
} from "../../utils/metrics-data";

type DailyFlowChartProps = {
  points: DailyPoint[];
  metric: "pax" | "revenue" | "reservations";
  averageWindow?: number;
};

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 320;

const PLOT_TOP = 24;
const PLOT_BOTTOM = 262;
const PLOT_LEFT = 16;
const PLOT_RIGHT = 928;

/**
 * Serie diaria con media móvil: la línea punteada es la que hay que mirar
 * para saber si el flujo real de pax por día está subiendo o bajando.
 */
export default function DailyFlowChart({
  points,
  metric,
  averageWindow = 7,
}: DailyFlowChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const values = useMemo(
    () =>
      points.map((point) =>
        metric === "pax"
          ? point.pax
          : metric === "revenue"
            ? point.revenue
            : point.reservations
      ),
    [points, metric]
  );

  const average = useMemo(
    () => movingAverage(values, averageWindow),
    [values, averageWindow]
  );

  const maxValue = Math.max(...values, 1);
  const scaleMax = maxValue * 1.15;

  const stepX =
    points.length > 1 ? (PLOT_RIGHT - PLOT_LEFT) / (points.length - 1) : 0;

  const pointX = (index: number) =>
    points.length > 1 ? PLOT_LEFT + stepX * index : (PLOT_LEFT + PLOT_RIGHT) / 2;

  const valueY = (value: number) =>
    PLOT_BOTTOM - (value / scaleMax) * (PLOT_BOTTOM - PLOT_TOP);

  const linePoints = values
    .map((value, index) => `${pointX(index)},${valueY(value)}`)
    .join(" ");

  const areaPath =
    points.length > 0
      ? `M ${pointX(0)},${PLOT_BOTTOM} L ${values
          .map((value, index) => `${pointX(index)},${valueY(value)}`)
          .join(" L ")} L ${pointX(points.length - 1)},${PLOT_BOTTOM} Z`
      : "";

  const averagePoints = average
    .map((value, index) =>
      value === null ? null : `${pointX(index)},${valueY(value)}`
    )
    .filter((entry): entry is string => entry !== null);

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((step) => scaleMax * step);

  const handleMove = (event: MouseEvent<SVGRectElement>) => {
    if (points.length === 0) return;

    const bounds = event.currentTarget.getBoundingClientRect();

    const ratio = (event.clientX - bounds.left) / bounds.width;

    const viewX = ratio * VIEW_WIDTH;

    const index = Math.round((viewX - PLOT_LEFT) / (stepX || 1));

    setHoveredIndex(Math.min(Math.max(index, 0), points.length - 1));
  };

  const hovered = hoveredIndex === null ? null : points[hoveredIndex];
  const hoveredAverage = hoveredIndex === null ? null : average[hoveredIndex];

  const labelEvery = Math.max(Math.ceil(points.length / 10), 1);

  const formatValue = (value: number) =>
    metric === "revenue" ? formatCompactMoney(value) : formatInteger(value);

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="block w-full min-w-[720px]"
          role="img"
          aria-label="Flujo diario de visitantes"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="dailyArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <rect
            x="0"
            y="0"
            width={VIEW_WIDTH}
            height={VIEW_HEIGHT}
            fill="#020617"
          />

          {gridValues.map((value) => (
            <g key={`grid-${value}`}>
              <line
                x1={PLOT_LEFT}
                y1={valueY(value)}
                x2={PLOT_RIGHT}
                y2={valueY(value)}
                stroke="#1e293b"
                strokeWidth="1"
              />

              <text
                x={PLOT_RIGHT + 10}
                y={valueY(value) + 4}
                fill="#64748b"
                fontSize="12"
                fontWeight="700"
              >
                {formatValue(value)}
              </text>
            </g>
          ))}

          {areaPath && <path d={areaPath} fill="url(#dailyArea)" />}

          {linePoints && (
            <polyline
              points={linePoints}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {averagePoints.length > 1 && (
            <polyline
              points={averagePoints.join(" ")}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeDasharray="7 5"
              strokeLinejoin="round"
            />
          )}

          {points.map((point, index) =>
            index % labelEvery === 0 ? (
              <text
                key={point.date}
                x={pointX(index)}
                y={PLOT_BOTTOM + 24}
                fill="#64748b"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {formatDayLabel(point.date).replace(/ \d{4}$/, "")}
              </text>
            ) : null
          )}

          {hovered && (
            <g>
              <line
                x1={pointX(hoveredIndex as number)}
                y1={PLOT_TOP}
                x2={pointX(hoveredIndex as number)}
                y2={PLOT_BOTTOM}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />

              <circle
                cx={pointX(hoveredIndex as number)}
                cy={valueY(values[hoveredIndex as number])}
                r="5"
                fill="#38bdf8"
                stroke="#020617"
                strokeWidth="2"
              />
            </g>
          )}

          <rect
            x={PLOT_LEFT}
            y={PLOT_TOP}
            width={PLOT_RIGHT - PLOT_LEFT}
            height={PLOT_BOTTOM - PLOT_TOP}
            fill="transparent"
            onMouseMove={handleMove}
          />

          {points.length === 0 && (
            <text
              x={VIEW_WIDTH / 2}
              y={(PLOT_TOP + PLOT_BOTTOM) / 2}
              fill="#475569"
              fontSize="18"
              fontWeight="800"
              textAnchor="middle"
            >
              Sin datos en el rango
            </text>
          )}
        </svg>
      </div>

      {hovered && (
        <div
          className="pointer-events-none absolute top-3 z-10 w-52 border border-slate-700 bg-slate-900/95 px-3 py-2.5 text-white shadow-xl"
          style={{
            left: `${Math.min(Math.max((pointX(hoveredIndex as number) / VIEW_WIDTH) * 100, 12), 78)}%`,
          }}
        >
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            {formatDayLabel(hovered.date)}
          </p>

          <div className="mt-1.5 space-y-1 text-[11px] font-bold text-slate-300">
            <p className="flex justify-between">
              <span>Pax</span>
              <span className="text-white">{formatInteger(hovered.pax)}</span>
            </p>

            <p className="flex justify-between">
              <span>Reservaciones</span>
              <span className="text-white">
                {formatInteger(hovered.reservations)}
              </span>
            </p>

            <p className="flex justify-between">
              <span>Ingreso</span>
              <span className="text-white">
                {formatCompactMoney(hovered.revenue)}
              </span>
            </p>

            {hoveredAverage !== null && (
              <p className="flex justify-between border-t border-slate-700 pt-1">
                <span>Media {averageWindow}d</span>
                <span className="text-amber-300">
                  {metric === "revenue"
                    ? formatCompactMoney(hoveredAverage)
                    : formatDecimal(hoveredAverage, 1)}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-slate-800 bg-slate-950 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 bg-sky-400" />
          {metric === "revenue"
            ? "Ingreso del día"
            : metric === "pax"
              ? "Pax del día"
              : "Reservaciones del día"}
        </span>

        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 bg-amber-400" />
          Media móvil {averageWindow} días
        </span>
      </div>
    </div>
  );
}

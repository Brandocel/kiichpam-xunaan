"use client";

import { useState } from "react";

import {
  formatCompactMoney,
  formatInteger,
  formatShare,
  type ChannelMonthlyPoint,
} from "../../utils/metrics-data";

type ChannelStackChartProps = {
  points: ChannelMonthlyPoint[];
  channels: string[];
  colors: Record<string, string>;
  metric: "pax" | "revenue" | "reservations";
};

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 330;

const PLOT_TOP = 20;
const PLOT_BOTTOM = 272;
const PLOT_LEFT = 16;
const PLOT_RIGHT = 918;

/**
 * Barras apiladas por mes y por origen: muestra de dónde viene el
 * crecimiento del año y qué canal está perdiendo peso.
 */
export default function ChannelStackChart({
  points,
  channels,
  colors,
  metric,
}: ChannelStackChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxTotal = Math.max(...points.map((point) => point.total), 1);
  const scaleMax = maxTotal * 1.12;

  const bandWidth = (PLOT_RIGHT - PLOT_LEFT) / points.length;
  const barWidth = Math.min(bandWidth * 0.58, 44);

  const valueToHeight = (value: number) =>
    (value / scaleMax) * (PLOT_BOTTOM - PLOT_TOP);

  const bandCenter = (index: number) =>
    PLOT_LEFT + bandWidth * index + bandWidth / 2;

  const gridValues = [0, 0.5, 1].map((step) => scaleMax * step);

  const formatValue = (value: number) =>
    metric === "revenue" ? formatCompactMoney(value) : formatInteger(value);

  const hovered = hoveredIndex === null ? null : points[hoveredIndex];

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="block w-full min-w-[720px]"
          role="img"
          aria-label="Aportación mensual por origen"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {gridValues.map((value) => {
            const y = PLOT_BOTTOM - valueToHeight(value);

            return (
              <g key={`grid-${value}`}>
                <line
                  x1={PLOT_LEFT}
                  y1={y}
                  x2={PLOT_RIGHT}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />

                <text
                  x={PLOT_RIGHT + 10}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="12"
                  fontWeight="700"
                >
                  {formatValue(value)}
                </text>
              </g>
            );
          })}

          {points.map((point, index) => {
            const center = bandCenter(index);

            let cursorY = PLOT_BOTTOM;

            const isHovered = hoveredIndex === index;

            return (
              <g key={point.key}>
                {channels.map((channel) => {
                  const value = point.values[channel] || 0;

                  if (value <= 0) return null;

                  const height = valueToHeight(value);

                  cursorY -= height;

                  return (
                    <rect
                      key={`${point.key}-${channel}`}
                      x={center - barWidth / 2}
                      y={cursorY}
                      width={barWidth}
                      height={Math.max(height, 1)}
                      fill={colors[channel] || "#94a3b8"}
                      opacity={isHovered || hoveredIndex === null ? 1 : 0.35}
                    />
                  );
                })}

                {point.total > 0 && (
                  <text
                    x={center}
                    y={PLOT_BOTTOM - valueToHeight(point.total) - 8}
                    fill="#0f172a"
                    fontSize="12"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {formatValue(point.total)}
                  </text>
                )}

                <text
                  x={center}
                  y={PLOT_BOTTOM + 24}
                  fill={isHovered ? "#0f172a" : "#64748b"}
                  fontSize="13"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {point.label}
                </text>

                <rect
                  x={center - bandWidth / 2}
                  y={PLOT_TOP}
                  width={bandWidth}
                  height={PLOT_BOTTOM - PLOT_TOP + 30}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(index)}
                />
              </g>
            );
          })}

          <line
            x1={PLOT_LEFT}
            y1={PLOT_BOTTOM}
            x2={PLOT_RIGHT}
            y2={PLOT_BOTTOM}
            stroke="#cbd5f5"
            strokeWidth="2"
          />
        </svg>
      </div>

      {hovered && hovered.total > 0 && (
        <div
          className="pointer-events-none absolute top-2 z-10 w-56 border border-slate-300 bg-white px-3 py-2.5 shadow-xl"
          style={{
            left: `${Math.min(Math.max((bandCenter(hoveredIndex as number) / VIEW_WIDTH) * 100, 12), 74)}%`,
          }}
        >
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
            {hovered.label} · {formatValue(hovered.total)}
          </p>

          <div className="mt-2 space-y-1">
            {channels
              .filter((channel) => (hovered.values[channel] || 0) > 0)
              .sort(
                (a, b) => (hovered.values[b] || 0) - (hovered.values[a] || 0)
              )
              .map((channel) => (
                <p
                  key={channel}
                  className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0"
                      style={{ backgroundColor: colors[channel] || "#94a3b8" }}
                    />

                    <span className="truncate">{channel}</span>
                  </span>

                  <span className="whitespace-nowrap text-slate-900">
                    {formatValue(hovered.values[channel] || 0)} ·{" "}
                    {formatShare((hovered.values[channel] || 0) / hovered.total, 0)}
                  </span>
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

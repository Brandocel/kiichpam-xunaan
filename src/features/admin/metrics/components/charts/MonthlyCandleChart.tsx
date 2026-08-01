"use client";

import { useMemo, useState } from "react";

import {
  formatCompactMoney,
  formatDecimal,
  formatInteger,
  movingAverage,
  type MonthlyCandle,
} from "../../utils/metrics-data";

type MonthlyCandleChartProps = {
  candles: MonthlyCandle[];
  year: number;
  volumeMetric: "revenue" | "reservations";
};

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 470;

const PLOT_TOP = 24;
const PLOT_BOTTOM = 320;
const VOLUME_TOP = 356;
const VOLUME_BOTTOM = 430;

const PLOT_LEFT = 16;
const PLOT_RIGHT = 928;

const UP_COLOR = "#34d399";
const DOWN_COLOR = "#f87171";
const MA_COLOR = "#fbbf24";

/**
 * Vela mensual del pax diario: abre con el primer día con entradas del mes,
 * cierra con el último y las mechas marcan el mejor y el peor día.
 * Debajo va el volumen (ingreso o reservaciones), como en una gráfica bursátil.
 */
export default function MonthlyCandleChart({
  candles,
  year,
  volumeMetric,
}: MonthlyCandleChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const withData = candles.filter((candle) => candle.hasData);

  const { priceMin, priceMax, volumeMax, maSeries } = useMemo(() => {
    const highs = withData.map((candle) => candle.high);
    const lows = withData.map((candle) => candle.low);

    const rawMax = highs.length > 0 ? Math.max(...highs) : 10;
    const rawMin = lows.length > 0 ? Math.min(...lows) : 0;

    const padding = Math.max((rawMax - rawMin) * 0.18, 2);

    const volumes = candles.map((candle) =>
      volumeMetric === "revenue" ? candle.revenue : candle.reservations
    );

    // La media móvil se corta en el último mes con datos: si no, la línea
    // se desploma al piso en los meses del año que todavía no pasan.
    const rawMa = movingAverage(
      candles.map((candle) => candle.paxPerDay),
      3
    );

    const ma = rawMa.map((value, index) =>
      candles[index].hasData ? value : null
    );

    return {
      priceMin: Math.max(rawMin - padding, 0),
      priceMax: rawMax + padding,
      volumeMax: Math.max(...volumes, 1),
      maSeries: ma,
    };
  }, [candles, withData, volumeMetric]);

  const bandWidth = (PLOT_RIGHT - PLOT_LEFT) / candles.length;
  const bodyWidth = Math.min(bandWidth * 0.46, 34);

  const priceToY = (value: number) => {
    const span = priceMax - priceMin || 1;

    return PLOT_BOTTOM - ((value - priceMin) / span) * (PLOT_BOTTOM - PLOT_TOP);
  };

  const volumeToY = (value: number) => {
    return VOLUME_BOTTOM - (value / volumeMax) * (VOLUME_BOTTOM - VOLUME_TOP);
  };

  const bandCenter = (index: number) =>
    PLOT_LEFT + bandWidth * index + bandWidth / 2;

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map(
    (step) => priceMin + (priceMax - priceMin) * step
  );

  const maPath = maSeries
    .map((value, index) => {
      if (value === null) return null;

      return `${bandCenter(index)},${priceToY(value)}`;
    })
    .filter((point): point is string => point !== null);

  const hovered = hoveredIndex === null ? null : candles[hoveredIndex];

  const hasAnyData = withData.length > 0;

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="block w-full min-w-[720px]"
          role="img"
          aria-label={`Velas mensuales de pax por día en ${year}`}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="candleGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect
            x="0"
            y="0"
            width={VIEW_WIDTH}
            height={VIEW_HEIGHT}
            fill="#020617"
          />

          <rect
            x={PLOT_LEFT}
            y={PLOT_TOP}
            width={PLOT_RIGHT - PLOT_LEFT}
            height={PLOT_BOTTOM - PLOT_TOP}
            fill="url(#candleGlow)"
          />

          {gridValues.map((value) => (
            <g key={`grid-${value}`}>
              <line
                x1={PLOT_LEFT}
                y1={priceToY(value)}
                x2={PLOT_RIGHT}
                y2={priceToY(value)}
                stroke="#1e293b"
                strokeWidth="1"
              />

              <text
                x={PLOT_RIGHT + 10}
                y={priceToY(value) + 4}
                fill="#64748b"
                fontSize="12"
                fontWeight="700"
              >
                {formatDecimal(value, 0)}
              </text>
            </g>
          ))}

          <text
            x={PLOT_LEFT}
            y={PLOT_TOP - 8}
            fill="#94a3b8"
            fontSize="12"
            fontWeight="800"
          >
            PAX POR DÍA · {year}
          </text>

          <line
            x1={PLOT_LEFT}
            y1={VOLUME_BOTTOM}
            x2={PLOT_RIGHT}
            y2={VOLUME_BOTTOM}
            stroke="#1e293b"
            strokeWidth="1"
          />

          <text
            x={PLOT_LEFT}
            y={VOLUME_TOP - 10}
            fill="#94a3b8"
            fontSize="12"
            fontWeight="800"
          >
            {volumeMetric === "revenue"
              ? "VOLUMEN · INGRESO PAGADO"
              : "VOLUMEN · RESERVACIONES"}
          </text>

          {candles.map((candle, index) => {
            const center = bandCenter(index);

            const volumeValue =
              volumeMetric === "revenue" ? candle.revenue : candle.reservations;

            const color = candle.isUp ? UP_COLOR : DOWN_COLOR;

            const isHovered = hoveredIndex === index;

            const bodyTop = priceToY(Math.max(candle.open, candle.close));
            const bodyBottom = priceToY(Math.min(candle.open, candle.close));

            return (
              <g key={candle.key} opacity={candle.hasData ? 1 : 0.25}>
                {isHovered && (
                  <rect
                    x={center - bandWidth / 2}
                    y={PLOT_TOP}
                    width={bandWidth}
                    height={VOLUME_BOTTOM - PLOT_TOP}
                    fill="#e2e8f0"
                    opacity="0.06"
                  />
                )}

                {candle.hasData && (
                  <>
                    <line
                      x1={center}
                      y1={priceToY(candle.high)}
                      x2={center}
                      y2={priceToY(candle.low)}
                      stroke={color}
                      strokeWidth="2"
                    />

                    <rect
                      x={center - bodyWidth / 2}
                      y={bodyTop}
                      width={bodyWidth}
                      height={Math.max(bodyBottom - bodyTop, 2)}
                      fill={candle.isUp ? color : "#0f172a"}
                      stroke={color}
                      strokeWidth="2"
                    />
                  </>
                )}

                {volumeValue > 0 && (
                  <rect
                    x={center - bodyWidth / 2}
                    y={volumeToY(volumeValue)}
                    width={bodyWidth}
                    height={Math.max(VOLUME_BOTTOM - volumeToY(volumeValue), 1)}
                    fill={color}
                    opacity={isHovered ? 0.9 : 0.45}
                  />
                )}

                <text
                  x={center}
                  y={VOLUME_BOTTOM + 22}
                  fill={isHovered ? "#e2e8f0" : "#64748b"}
                  fontSize="13"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {candle.label}
                </text>

                <rect
                  x={center - bandWidth / 2}
                  y={PLOT_TOP}
                  width={bandWidth}
                  height={VOLUME_BOTTOM - PLOT_TOP + 30}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(index)}
                />
              </g>
            );
          })}

          {maPath.length > 1 && (
            <polyline
              points={maPath.join(" ")}
              fill="none"
              stroke={MA_COLOR}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="6 5"
            />
          )}

          {!hasAnyData && (
            <text
              x={VIEW_WIDTH / 2}
              y={(PLOT_TOP + PLOT_BOTTOM) / 2}
              fill="#475569"
              fontSize="18"
              fontWeight="800"
              textAnchor="middle"
            >
              Sin visitas registradas en {year}
            </text>
          )}
        </svg>
      </div>

      {hovered && hovered.hasData && (
        <div
          className="pointer-events-none absolute top-3 z-10 w-56 border border-slate-700 bg-slate-900/95 px-3 py-2.5 text-white shadow-xl"
          style={{
            left: `${Math.min(Math.max((bandCenter(hovered.month) / VIEW_WIDTH) * 100, 12), 78)}%`,
          }}
        >
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            {hovered.label} {hovered.year}
          </p>

          <p className="mt-1 text-lg font-black">
            {formatDecimal(hovered.paxPerDay, 1)} pax/día
          </p>

          <div className="mt-2 space-y-1 text-[11px] font-bold text-slate-300">
            <p className="flex justify-between">
              <span>Apertura</span>
              <span className="text-white">{formatInteger(hovered.open)}</span>
            </p>

            <p className="flex justify-between">
              <span>Máximo</span>
              <span className="text-emerald-300">
                {formatInteger(hovered.high)}
              </span>
            </p>

            <p className="flex justify-between">
              <span>Mínimo</span>
              <span className="text-rose-300">{formatInteger(hovered.low)}</span>
            </p>

            <p className="flex justify-between">
              <span>Cierre</span>
              <span className="text-white">{formatInteger(hovered.close)}</span>
            </p>

            <p className="flex justify-between border-t border-slate-700 pt-1">
              <span>Pax del mes</span>
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

            <p className="flex justify-between">
              <span>Días con visitas</span>
              <span className="text-white">
                {formatInteger(hovered.activeDays)} / {formatInteger(hovered.days)}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-slate-800 bg-slate-950 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 bg-emerald-400" />
          Mes al alza
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 border-2 border-rose-400 bg-slate-900" />
          Mes a la baja
        </span>

        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 bg-amber-400" />
          Media móvil 3 meses
        </span>

        <span className="ml-auto normal-case text-slate-500">
          Cuerpo = primer vs último día con visitas · Mecha = mejor y peor día
        </span>
      </div>
    </div>
  );
}

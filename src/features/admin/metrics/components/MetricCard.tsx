"use client";

import { formatPercent, type DeltaResult } from "../utils/metrics-data";

type Tone = "dark" | "light";

export function DeltaBadge({
  delta,
  suffix,
  tone = "light",
}: {
  delta: DeltaResult;
  suffix?: string;
  tone?: Tone;
}) {
  const isUp = delta.direction === "up";
  const isFlat = delta.direction === "flat";

  const arrow = isFlat ? "→" : isUp ? "▲" : "▼";

  const toneClass = isFlat
    ? tone === "dark"
      ? "border-white/15 bg-white/5 text-slate-300"
      : "border-slate-300 bg-slate-100 text-slate-600"
    : isUp
      ? tone === "dark"
        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
        : "border-emerald-300 bg-emerald-50 text-emerald-700"
      : tone === "dark"
        ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
        : "border-rose-300 bg-rose-50 text-rose-700";

  // Sin base en el periodo anterior no hay porcentaje que calcular:
  // se muestra "nuevo" en vez de un guion que se lee como error.
  const value =
    delta.pct !== null
      ? formatPercent(delta.pct)
      : delta.direction === "up"
        ? "nuevo"
        : "—";

  return (
    <span
      className={[
        "inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-black",
        toneClass,
      ].join(" ")}
    >
      {arrow} {value}
      {suffix ? <span className="font-bold opacity-80">{suffix}</span> : null}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  delta,
  deltaSuffix,
  tone = "light",
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: DeltaResult;
  deltaSuffix?: string;
  tone?: Tone;
  accent?: boolean;
}) {
  const isDark = tone === "dark";

  return (
    <div
      className={[
        "border px-4 py-3",
        isDark
          ? accent
            ? "border-sky-400/40 bg-sky-400/10"
            : "border-white/10 bg-white/5"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <p
        className={[
          "text-[11px] font-black uppercase tracking-wide",
          isDark ? "text-slate-400" : "text-slate-400",
        ].join(" ")}
      >
        {label}
      </p>

      <p
        className={[
          "mt-1 text-2xl font-black leading-tight",
          isDark ? "text-white" : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {delta ? (
          <DeltaBadge delta={delta} suffix={deltaSuffix} tone={tone} />
        ) : null}

        {hint ? (
          <span
            className={[
              "text-[11px] font-semibold",
              isDark ? "text-slate-400" : "text-slate-500",
            ].join(" ")}
          >
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}

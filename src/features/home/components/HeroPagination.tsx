"use client";

import { useEffect, useRef, useState } from "react";

type HeroPaginationProps = {
  total: number;
  active: number;
  onChange: (index: number) => void;
  className?: string;

  dotSize?: number;
  gap?: number;
  pillHeight?: number;
  bottomOffset?: number;

  dotBorderColor?: string;
  pillBorderColor?: string;
  hideActiveDotBorder?: boolean;
  boldPill?: boolean;
};

export default function HeroPagination({
  total,
  active,
  onChange,
  className = "",
  dotSize = 10,
  gap = 14,
  pillHeight = 10,
  bottomOffset = 32,
  dotBorderColor = "rgba(255,255,255,0.65)",
  pillBorderColor = "rgba(255,255,255,1)",
  hideActiveDotBorder = true,
  boldPill = true,
}: HeroPaginationProps) {
  const prevRef = useRef(active);

  const [pillLeft, setPillLeft] = useState(0);
  const [pillWidth, setPillWidth] = useState(dotSize);

  const xOf = (i: number) => i * (dotSize + gap);

  useEffect(() => {
    const prev = prevRef.current;
    const next = active;

    if (prev === next) {
      setPillLeft(xOf(next));
      setPillWidth(dotSize);
      return;
    }

    const left = Math.min(xOf(prev), xOf(next));
    const right = Math.max(xOf(prev), xOf(next));
    const distance = right - left;

    setPillLeft(left);
    setPillWidth(distance + dotSize);

    const timeout = window.setTimeout(() => {
      setPillLeft(xOf(next));
      setPillWidth(dotSize);
      prevRef.current = next;
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [active, dotSize, gap]);

  const trackWidth = total * dotSize + (total - 1) * gap;
  const pillBorder = boldPill ? 2 : 1;

  if (total <= 1) return null;

  return (
    <div
      className={`pointer-events-auto absolute left-1/2 z-20 -translate-x-1/2 ${className}`}
      style={{ bottom: `${bottomOffset}px` }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: trackWidth, height: Math.max(dotSize, pillHeight) }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: total }).map((_, i) => {
            const isActiveDot = i === active;

            const border =
              hideActiveDotBorder && isActiveDot
                ? "1px solid transparent"
                : `1px solid ${dotBorderColor}`;

            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i)}
                aria-label={`Ir al slide ${i + 1}`}
                className="relative shrink-0 rounded-full"
                style={{
                  width: dotSize,
                  height: dotSize,
                  marginRight: i === total - 1 ? 0 : gap,
                }}
              >
                <span
                  className="block rounded-full bg-transparent"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    border,
                  }}
                />
              </button>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-transparent"
          style={{
            height: pillHeight,
            left: pillLeft,
            width: pillWidth,
            border: `${pillBorder}px solid ${pillBorderColor}`,
            transition: "left 220ms ease, width 220ms ease",
          }}
        />
      </div>
    </div>
  );
}
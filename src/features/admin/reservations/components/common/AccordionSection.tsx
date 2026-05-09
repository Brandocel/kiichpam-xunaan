"use client";

import { useState, type ReactNode } from "react";

type AccordionSectionProps = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
};

export default function AccordionSection({
  title,
  subtitle,
  defaultOpen = false,
  badge,
  children,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50"
        aria-expanded={isOpen}
      >
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {badge}

          <span
            className={[
              "flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition",
              isOpen ? "rotate-180 bg-slate-100" : "",
            ].join(" ")}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-4 py-4">{children}</div>
      )}
    </section>
  );
}
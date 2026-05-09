"use client";

import { useEffect, useState, type ReactNode } from "react";

type DrawerShellProps = {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  widthClassName?: string;
  positionClassName?: string;
  panelZIndexClassName?: string;
  backdropZIndexClassName?: string;
  showBackdrop?: boolean;
};

export default function DrawerShell({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  headerRight,
  footer,
  children,
  widthClassName = "max-w-2xl",
  positionClassName = "right-0",
  panelZIndexClassName = "z-50",
  backdropZIndexClassName = "z-40",
  showBackdrop = true,
}: DrawerShellProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);

      const frame = requestAnimationFrame(() => {
        setIsActive(true);
      });

      return () => cancelAnimationFrame(frame);
    }

    setIsActive(false);

    const timeout = window.setTimeout(() => {
      setShouldRender(false);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!shouldRender) return null;

  return (
    <>
      {showBackdrop && (
        <button
          type="button"
          aria-label="Cerrar panel"
          onClick={onClose}
          className={[
            "fixed inset-0 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-300",
            backdropZIndexClassName,
            isActive ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 flex w-full flex-col border-l border-slate-200 bg-slate-50 shadow-2xl transition-transform duration-300 ease-out",
          widthClassName,
          positionClassName,
          panelZIndexClassName,
          isActive ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                  {eyebrow}
                </p>
              )}

              <h2 className="mt-1 truncate text-2xl font-black text-slate-950">
                {title}
              </h2>

              {subtitle && (
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3">
              {headerRight}

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label="Cerrar"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6L14 14M14 6L6 14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer && (
          <div className="border-t border-slate-200 bg-white px-5 py-4">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
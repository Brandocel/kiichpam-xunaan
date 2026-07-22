"use client";

import { useEffect, useRef, useState } from "react";

import type { ApiReservation } from "../../types/reservation.types";
import {
  getAttributionEvidence,
  type AttributionVerificationLevel,
} from "../../utils/attribution-evidence";

const PANEL_WIDTH = 360;

function getVerificationChipClass(level: AttributionVerificationLevel) {
  switch (level) {
    case "verified":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "declared":
      return "border-amber-300 bg-amber-50 text-amber-800";
    case "referrer":
      return "border-sky-300 bg-sky-50 text-sky-700";
    case "none":
    default:
      return "border-slate-300 bg-slate-100 text-slate-600";
  }
}

function VerificationIcon({ level }: { level: AttributionVerificationLevel }) {
  if (level === "verified") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
        <path
          d="M5 12.5L10 17.5L19 7"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 8V12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1.1" fill="currentColor" />
    </svg>
  );
}

export default function AttributionTracePopover({
  reservation,
}: {
  reservation: ApiReservation;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const siteBaseUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  const evidence = getAttributionEvidence(reservation, siteBaseUrl);

  function openPanel() {
    const buttonRect = buttonRef.current?.getBoundingClientRect();

    if (buttonRect) {
      const maxLeft = window.innerWidth - PANEL_WIDTH - 12;

      setPanelPosition({
        top: buttonRect.bottom + 6,
        left: Math.max(12, Math.min(buttonRect.left, maxLeft)),
      });
    }

    setCopied(false);
    setIsOpen(true);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    function handleViewportChange() {
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [isOpen]);

  async function copyTrackedUrl() {
    if (!evidence.trackedUrl) return;

    try {
      await navigator.clipboard.writeText(evidence.trackedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // El navegador puede bloquear clipboard sin HTTPS; se ignora.
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
        className={[
          "mt-1.5 inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide transition",
          isOpen
            ? "border-slate-950 bg-slate-950 text-white"
            : "border-slate-300 bg-white text-slate-500 hover:border-slate-600 hover:text-slate-900",
        ].join(" ")}
        title="Ver cómo se rastreó el origen de esta reservación"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden="true">
          <path
            d="M10 14L14 10M8.5 15.5L7 17C5.6 18.4 5.6 20 7 21C8.4 22.4 10 22.4 11.4 21L14 18.4M15.5 8.5L17 7C18.4 5.6 18.4 4 17 3C15.6 1.6 14 1.6 12.6 3L10 5.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        Rastreo
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          className="fixed z-50 border border-slate-400 bg-white shadow-xl"
          style={{
            top: panelPosition.top,
            left: panelPosition.left,
            width: PANEL_WIDTH,
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-3 py-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">
              Rastreo del link · {reservation.folio}
            </p>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm font-black text-slate-500 hover:text-slate-950"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto px-3 py-3">
            <span
              className={[
                "inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-black uppercase tracking-wide",
                getVerificationChipClass(evidence.verification.level),
              ].join(" ")}
            >
              <VerificationIcon level={evidence.verification.level} />
              {evidence.verification.label}
            </span>

            <p className="mt-2 text-[11px] font-medium leading-5 text-slate-600">
              {evidence.verification.detail}
            </p>

            {evidence.trackedUrl ? (
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {evidence.isReconstructed
                      ? "URL reconstruida con lo guardado"
                      : "URL real de llegada"}
                  </p>

                  <button
                    type="button"
                    onClick={copyTrackedUrl}
                    className="border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-black uppercase text-slate-600 transition hover:border-slate-600 hover:text-slate-950"
                  >
                    {copied ? "Copiado ✓" : "Copiar"}
                  </button>
                </div>

                <p className="mt-1 break-all border border-slate-300 bg-slate-50 px-2 py-1.5 font-mono text-[11px] leading-4 text-slate-800">
                  {evidence.trackedUrl}
                </p>
              </div>
            ) : (
              <p className="mt-3 border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-500">
                Esta reservación no guardó URL ni parámetros de rastreo.
              </p>
            )}

            {evidence.referrer ? (
              <div className="mt-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Vino desde (referrer)
                </p>

                <p className="mt-1 break-all border border-slate-300 bg-slate-50 px-2 py-1.5 font-mono text-[11px] leading-4 text-slate-800">
                  {evidence.referrer}
                </p>
              </div>
            ) : null}

            {evidence.params.length > 0 ? (
              <div className="mt-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Parámetros registrados
                </p>

                <ul className="mt-1 divide-y divide-slate-200 border border-slate-300">
                  {evidence.params.map((param) => (
                    <li
                      key={param.key}
                      className="flex items-start gap-2 px-2 py-1.5"
                    >
                      <span className="shrink-0 font-mono text-[11px] font-black text-slate-700">
                        {param.key}
                      </span>

                      <span className="min-w-0 break-all font-mono text-[11px] text-slate-500">
                        {param.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

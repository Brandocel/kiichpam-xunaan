"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ReservationLifecycleProgress,
  ReservationLifecycleResponse,
  ReservationLifecycleStep,
} from "../../types/reservation-lifecycle.types";
import { formatDateTime } from "../../utils/reservation-formatters";

type CompactLifecycleTreeProps = {
  lifecycle: ReservationLifecycleResponse | null;
  isLoading: boolean;
  errorMessage: string;
};

type StepTone = "success" | "warning" | "danger" | "muted" | "pending";

function getProgressPercentage(progress?: ReservationLifecycleProgress) {
  const value = Number(progress?.percentage || 0);

  if (value < 0) return 0;
  if (value > 100) return 100;

  return value;
}

function normalizeStatus(status: string | null | undefined) {
  return String(status || "").toUpperCase();
}

function isCompletedStep(step: ReservationLifecycleStep) {
  return normalizeStatus(step.status) === "COMPLETED";
}

function isPendingStep(step: ReservationLifecycleStep) {
  return normalizeStatus(step.status) === "PENDING";
}

function isSkippedStep(step: ReservationLifecycleStep) {
  return normalizeStatus(step.status) === "SKIPPED";
}

function isWarningStep(step: ReservationLifecycleStep) {
  return normalizeStatus(step.status) === "WARNING";
}

function isFailedStep(step: ReservationLifecycleStep) {
  const status = normalizeStatus(step.status);

  return status === "FAILED" || status === "ERROR";
}

function isAttentionStep(step: ReservationLifecycleStep) {
  return Boolean(step.blocker) || isWarningStep(step) || isFailedStep(step);
}

function getCurrentStepKey(lifecycle: ReservationLifecycleResponse | null) {
  if (!lifecycle?.steps?.length) return "";

  if (lifecycle.currentBlocker?.key) return lifecycle.currentBlocker.key;

  const failedStep = lifecycle.steps.find((step) => isFailedStep(step));
  if (failedStep) return failedStep.key;

  const warningStep = lifecycle.steps.find((step) => isWarningStep(step));
  if (warningStep) return warningStep.key;

  const pendingStep = lifecycle.steps.find((step) => isPendingStep(step));
  if (pendingStep) return pendingStep.key;

  return lifecycle.steps[lifecycle.steps.length - 1]?.key || "";
}

function getStepTone(step: ReservationLifecycleStep): StepTone {
  if (isFailedStep(step)) return "danger";
  if (isWarningStep(step) || step.blocker) return "warning";
  if (isCompletedStep(step)) return "success";
  if (isSkippedStep(step)) return "muted";

  return "pending";
}

function getStepStatusLabel(status: string | null | undefined) {
  switch (normalizeStatus(status)) {
    case "COMPLETED":
      return "Listo";
    case "PENDING":
      return "Pendiente";
    case "WARNING":
      return "Revisar";
    case "FAILED":
    case "ERROR":
      return "Con problema";
    case "SKIPPED":
      return "Omitido";
    default:
      return status || "Sin estado";
  }
}

function getStepVisual(step: ReservationLifecycleStep) {
  const tone = getStepTone(step);

  switch (tone) {
    case "success":
      return {
        dot: "bg-emerald-600 text-white ring-emerald-100",
        line: "bg-emerald-200",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        card: "border-emerald-200 bg-emerald-50/40",
        text: "text-emerald-700",
        soft: "bg-emerald-50 border-emerald-200",
        progress: "bg-emerald-500",
      };

    case "warning":
      return {
        dot: "bg-amber-500 text-white ring-amber-100",
        line: "bg-amber-200",
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        card: "border-amber-200 bg-amber-50/50",
        text: "text-amber-700",
        soft: "bg-amber-50 border-amber-200",
        progress: "bg-amber-500",
      };

    case "danger":
      return {
        dot: "bg-red-600 text-white ring-red-100",
        line: "bg-red-200",
        badge: "border-red-200 bg-red-50 text-red-700",
        card: "border-red-200 bg-red-50/50",
        text: "text-red-700",
        soft: "bg-red-50 border-red-200",
        progress: "bg-red-500",
      };

    case "muted":
      return {
        dot: "bg-slate-400 text-white ring-slate-100",
        line: "bg-slate-200",
        badge: "border-slate-200 bg-slate-100 text-slate-600",
        card: "border-slate-200 bg-slate-50",
        text: "text-slate-600",
        soft: "bg-slate-50 border-slate-200",
        progress: "bg-slate-400",
      };

    case "pending":
    default:
      return {
        dot: "bg-slate-500 text-white ring-slate-100",
        line: "bg-slate-200",
        badge: "border-slate-200 bg-white text-slate-600",
        card: "border-slate-200 bg-white",
        text: "text-slate-600",
        soft: "bg-slate-50 border-slate-200",
        progress: "bg-slate-500",
      };
  }
}

function getReadableStepTitle(step: ReservationLifecycleStep) {
  const key = step.key?.toUpperCase();

  switch (key) {
    case "RESERVATION_CREATED":
      return "Reserva creada";
    case "QUOTE_RESOLVED":
      return "Precio calculado";
    case "CUSTOMER_CONTACT":
      return "Datos del cliente";
    case "STRIPE_PAYMENT_CREATED":
      return "Pago iniciado";
    case "STRIPE_WEBHOOK":
      return "Confirmación de pago";
    case "RESERVATION_PAID":
      return "Reserva pagada";
    case "GOOGLE_CALENDAR":
      return "Calendario";
    case "CUSTOMER_EMAIL":
      return "Correo al cliente";
    case "OPERATIONS_EMAIL":
      return "Correo a operaciones";
    default:
      return step.title || "Paso de la reserva";
  }
}

function getStepGlyph(step: ReservationLifecycleStep) {
  const key = step.key?.toUpperCase();

  switch (key) {
    case "RESERVATION_CREATED":
      return "R";
    case "QUOTE_RESOLVED":
      return "$";
    case "CUSTOMER_CONTACT":
      return "@";
    case "STRIPE_PAYMENT_CREATED":
      return "P";
    case "STRIPE_WEBHOOK":
      return "✓";
    case "RESERVATION_PAID":
      return "MX";
    case "GOOGLE_CALENDAR":
      return "C";
    case "CUSTOMER_EMAIL":
      return "E";
    case "OPERATIONS_EMAIL":
      return "O";
    default:
      return String(step.order || "");
  }
}

function getReadableStepHelp(step: ReservationLifecycleStep) {
  const key = step.key?.toUpperCase();

  switch (key) {
    case "RESERVATION_CREATED":
      return "La reservación ya existe en el sistema y tiene un folio asignado.";

    case "QUOTE_RESOLVED":
      return "El sistema ya calculó el precio con personas, descuentos, campañas, cupones y extras.";

    case "CUSTOMER_CONTACT":
      return "Este paso valida si el cliente tiene datos suficientes para contactarlo, principalmente correo o teléfono.";

    case "STRIPE_PAYMENT_CREATED":
      return "Aquí se revisa si el cliente ya inició un proceso de pago o si existe una referencia de pago.";

    case "STRIPE_WEBHOOK":
      return "Aquí el sistema espera la confirmación automática del proveedor de pago.";

    case "RESERVATION_PAID":
      return "Este paso confirma que la reservación quedó marcada como pagada dentro del sistema.";

    case "GOOGLE_CALENDAR":
      return "Después del pago, la visita debe registrarse o actualizarse en el calendario.";

    case "CUSTOMER_EMAIL":
      return "Después del pago, el cliente debe recibir su correo de confirmación.";

    case "OPERATIONS_EMAIL":
      return "Después del pago, el equipo interno debe recibir la notificación para operar la reserva.";

    default:
      return "Este paso ayuda a conocer en qué parte del proceso se encuentra la reservación.";
  }
}

function getStepAction(step: ReservationLifecycleStep) {
  if (isCompletedStep(step)) {
    return "No requiere acción. Este paso ya se completó correctamente.";
  }

  if (isSkippedStep(step)) {
    return "Este paso fue omitido. Revisa si era obligatorio para esta reservación.";
  }

  const key = step.key?.toUpperCase();

  switch (key) {
    case "CUSTOMER_CONTACT":
      return "Agrega o corrige el correo, teléfono o nombre del cliente para que la comunicación automática pueda continuar.";

    case "STRIPE_PAYMENT_CREATED":
      return "Confirma si el cliente ya recibió la liga o referencia de pago. Si no, vuelve a generar el proceso de pago.";

    case "STRIPE_WEBHOOK":
      return "Espera la confirmación automática del pago. Si tarda demasiado, revisa el pago desde Stripe o confirma manualmente.";

    case "RESERVATION_PAID":
      return "Si el pago ya fue realizado, marca la reservación como pagada o revisa la confirmación del proveedor de pago.";

    case "GOOGLE_CALENDAR":
      return "Verifica que la reservación ya esté pagada y que la conexión con calendario esté disponible.";

    case "CUSTOMER_EMAIL":
      return "Verifica que el cliente tenga correo válido. Si el correo no llegó, puedes reenviarlo.";

    case "OPERATIONS_EMAIL":
      return "Verifica que el correo interno de operaciones esté configurado y vuelve a enviar la notificación si es necesario.";

    default:
      if (isFailedStep(step)) {
        return "Revisa este paso porque presenta un problema que puede detener el flujo.";
      }

      if (isWarningStep(step) || step.blocker) {
        return "Revisa esta información antes de continuar para evitar errores en el proceso.";
      }

      return "Espera a que este paso avance o revisa la acción relacionada con la reservación.";
  }
}

function getProblemStep(lifecycle: ReservationLifecycleResponse | null) {
  if (!lifecycle?.steps?.length) return null;

  if (lifecycle.currentBlocker) return lifecycle.currentBlocker;

  const failedStep = lifecycle.steps.find((step) => isFailedStep(step));
  if (failedStep) return failedStep;

  const warningStep = lifecycle.steps.find((step) => isWarningStep(step));
  if (warningStep) return warningStep;

  return null;
}

function getNextPendingStep(lifecycle: ReservationLifecycleResponse | null) {
  if (!lifecycle?.steps?.length) return null;

  return lifecycle.steps.find((step) => isPendingStep(step)) || null;
}

function SummaryBox({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-700"
      : tone === "warning"
      ? "text-amber-700"
      : tone === "danger"
      ? "text-red-700"
      : "text-slate-950";

  return (
    <div className="border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={["mt-1 text-xl font-black", toneClass].join(" ")}>
        {value}
      </p>
    </div>
  );
}

function LifecycleSkeleton() {
  return (
    <div className="space-y-5">
      <section className="border border-slate-200 bg-white p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-32 bg-slate-200" />
          <div className="h-8 w-72 bg-slate-200" />
          <div className="h-4 w-full max-w-2xl bg-slate-200" />
          <div className="h-2 w-full bg-slate-200" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border border-slate-200 bg-white px-4 py-3"
          >
            <div className="h-3 w-20 animate-pulse bg-slate-200" />
            <div className="mt-3 h-6 w-12 animate-pulse bg-slate-200" />
          </div>
        ))}
      </section>

      <section className="border border-slate-200 bg-white p-5">
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="relative pl-10">
              <div className="absolute left-0 top-2 h-6 w-6 animate-pulse rounded-full bg-slate-200" />
              <div className="border border-slate-200 bg-white px-4 py-3">
                <div className="h-4 w-56 animate-pulse bg-slate-200" />
                <div className="mt-3 h-3 w-full animate-pulse bg-slate-200" />
                <div className="mt-2 h-3 w-3/4 animate-pulse bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FlowMap({
  steps,
  selectedStepKey,
  problemStepKey,
  onSelect,
}: {
  steps: ReservationLifecycleStep[];
  selectedStepKey: string;
  problemStepKey: string;
  onSelect: (stepKey: string) => void;
}) {
  return (
    <section className="border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            Mapa del flujo
          </p>

          <h3 className="mt-1 text-xl font-black text-slate-950">
            Ruta visual de la reservación
          </h3>
        </div>

        <span className="border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
          {steps.length} pasos
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-start">
          {steps.map((step, index) => {
            const visual = getStepVisual(step);
            const isSelected = step.key === selectedStepKey;
            const isProblem = step.key === problemStepKey;

            return (
              <div key={`${step.order}-${step.key}`} className="flex items-start">
                <button
                  type="button"
                  onClick={() => onSelect(step.key)}
                  className="group flex w-28 flex-col items-center text-center"
                  aria-current={isSelected ? "step" : undefined}
                >
                  <span
                    className={[
                      "relative flex h-11 w-11 items-center justify-center border text-xs font-black ring-4 transition",
                      visual.dot,
                      isSelected ? "scale-110 ring-slate-200" : "",
                    ].join(" ")}
                  >
                    {getStepGlyph(step)}

                    {isProblem && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 border-2 border-white bg-red-600" />
                    )}
                  </span>

                  <span
                    className={[
                      "mt-2 line-clamp-2 text-[11px] font-black leading-4",
                      isSelected ? "text-slate-950" : "text-slate-500",
                    ].join(" ")}
                  >
                    {getReadableStepTitle(step)}
                  </span>

                  <span
                    className={[
                      "mt-1 border px-2 py-0.5 text-[9px] font-black uppercase",
                      visual.badge,
                    ].join(" ")}
                  >
                    {getStepStatusLabel(step.status)}
                  </span>
                </button>

                {index < steps.length - 1 && (
                  <div className="mt-[21px] flex w-12 items-center">
                    <span
                      className={[
                        "h-[2px] w-full",
                        isAttentionStep(step) ? "bg-amber-300" : visual.line,
                      ].join(" ")}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BreakpointCard({
  problemStep,
  nextPendingStep,
}: {
  problemStep: ReservationLifecycleStep | null;
  nextPendingStep: ReservationLifecycleStep | null;
}) {
  if (problemStep) {
    const visual = getStepVisual(problemStep);

    return (
      <section className={["border px-5 py-4", visual.soft].join(" ")}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className={["text-xs font-black uppercase tracking-[0.2em]", visual.text].join(" ")}>
              Aquí necesita atención
            </p>

            <h4 className="mt-2 text-xl font-black text-slate-950">
              {getReadableStepTitle(problemStep)}
            </h4>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              {problemStep.message || getReadableStepHelp(problemStep)}
            </p>

            <div className="mt-3 border border-white/70 bg-white/70 px-3 py-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Qué hacer
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                {getStepAction(problemStep)}
              </p>
            </div>
          </div>

          <div className="shrink-0 border border-white/70 bg-white/70 px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
              Paso
            </p>
            <p className="mt-1 text-3xl font-black text-slate-950">
              {problemStep.order}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (nextPendingStep) {
    return (
      <section className="border border-slate-200 bg-white px-5 py-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Siguiente paso
        </p>

        <h4 className="mt-2 text-xl font-black text-slate-950">
          {getReadableStepTitle(nextPendingStep)}
        </h4>

        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
          {getReadableStepHelp(nextPendingStep)}
        </p>
      </section>
    );
  }

  return (
    <section className="border border-emerald-200 bg-emerald-50 px-5 py-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
        Flujo completo
      </p>

      <h4 className="mt-2 text-xl font-black text-emerald-950">
        No hay puntos detenidos
      </h4>

      <p className="mt-2 text-sm font-semibold leading-6 text-emerald-800">
        La reservación completó sus pasos principales correctamente.
      </p>
    </section>
  );
}

function SelectedStepInsight({
  step,
}: {
  step: ReservationLifecycleStep | undefined;
}) {
  if (!step) return null;

  const visual = getStepVisual(step);

  return (
    <section className={["border px-5 py-4", visual.soft].join(" ")}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Paso seleccionado
            </p>

            <span
              className={[
                "border px-2.5 py-1 text-[10px] font-black uppercase",
                visual.badge,
              ].join(" ")}
            >
              {getStepStatusLabel(step.status)}
            </span>
          </div>

          <h4 className="mt-2 text-xl font-black text-slate-950">
            {getReadableStepTitle(step)}
          </h4>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
            {step.message || getReadableStepHelp(step)}
          </p>
        </div>

        <div className="shrink-0 border border-white/70 bg-white/70 px-4 py-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            Fecha
          </p>
          <p className="mt-1 text-sm font-black text-slate-700">
            {formatDateTime(step.timestamp)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="border border-white/70 bg-white/70 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Qué significa
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
            {getReadableStepHelp(step)}
          </p>
        </div>

        <div className="border border-white/70 bg-white/70 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Qué hacer
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
            {getStepAction(step)}
          </p>
        </div>
      </div>
    </section>
  );
}

function TreeNode({
  step,
  isCurrent,
  isSelected,
  isLast,
  onSelect,
}: {
  step: ReservationLifecycleStep;
  isCurrent: boolean;
  isSelected: boolean;
  isLast: boolean;
  onSelect: (stepKey: string) => void;
}) {
  const visual = getStepVisual(step);
  const isProblem = isAttentionStep(step);

  return (
    <div className="relative pl-12">
      {!isLast && (
        <span
          className={[
            "absolute left-[15px] top-9 h-[calc(100%+8px)] w-[2px]",
            isProblem ? "bg-amber-300" : visual.line,
          ].join(" ")}
        />
      )}

      <button
        type="button"
        onClick={() => onSelect(step.key)}
        className={[
          "absolute left-0 top-2 flex h-8 w-8 items-center justify-center border text-xs font-black ring-4 transition",
          visual.dot,
          isSelected ? "scale-110 ring-slate-200" : "",
        ].join(" ")}
        aria-label={`Seleccionar ${getReadableStepTitle(step)}`}
      >
        {step.order}
      </button>

      {isProblem && (
        <div className="absolute left-8 top-5 hidden w-8 border-t-2 border-amber-300 sm:block" />
      )}

      <button
        type="button"
        onClick={() => onSelect(step.key)}
        className={[
          "w-full border px-4 py-3 text-left transition",
          isSelected
            ? "border-slate-950 bg-slate-50 ring-2 ring-slate-100"
            : visual.card,
        ].join(" ")}
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-black text-slate-950">
                {getReadableStepTitle(step)}
              </h4>

              <span
                className={[
                  "border px-2.5 py-1 text-[10px] font-black uppercase",
                  visual.badge,
                ].join(" ")}
              >
                {getStepStatusLabel(step.status)}
              </span>

              {isCurrent && (
                <span className="bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase text-white">
                  Paso actual
                </span>
              )}

              {isProblem && (
                <span className="bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase text-amber-700">
                  Punto de atención
                </span>
              )}
            </div>

            <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
              {step.message || getReadableStepHelp(step)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
              {formatDateTime(step.timestamp)}
            </span>

            <span
              className={[
                "h-2 w-2",
                isCompletedStep(step)
                  ? "bg-emerald-500"
                  : isAttentionStep(step)
                  ? "bg-amber-500"
                  : isFailedStep(step)
                  ? "bg-red-500"
                  : "bg-slate-400",
              ].join(" ")}
            />
          </div>
        </div>
      </button>
    </div>
  );
}

export default function CompactLifecycleTree({
  lifecycle,
  isLoading,
  errorMessage,
}: CompactLifecycleTreeProps) {
  const currentStepKey = useMemo(() => {
    return getCurrentStepKey(lifecycle);
  }, [lifecycle]);

  const problemStep = useMemo(() => {
    return getProblemStep(lifecycle);
  }, [lifecycle]);

  const nextPendingStep = useMemo(() => {
    return getNextPendingStep(lifecycle);
  }, [lifecycle]);

  const steps = useMemo(() => {
    return lifecycle?.steps || [];
  }, [lifecycle]);

  const defaultSelectedKey =
    problemStep?.key || currentStepKey || nextPendingStep?.key || steps[0]?.key || "";

  const [selectedStepKey, setSelectedStepKey] = useState(defaultSelectedKey);

  useEffect(() => {
    setSelectedStepKey(defaultSelectedKey);
  }, [defaultSelectedKey]);

  if (isLoading) {
    return <LifecycleSkeleton />;
  }

  if (errorMessage) {
    return (
      <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (!lifecycle) {
    return (
      <div className="border border-slate-200 bg-white px-5 py-10 text-center text-sm font-bold text-slate-500">
        No hay información del ciclo de vida.
      </div>
    );
  }

  const percentage = getProgressPercentage(lifecycle.progress);

  const completed = Number(lifecycle.progress?.completed || 0);
  const totalSteps = Number(lifecycle.progress?.totalSteps || 0);
  const warnings = Number(lifecycle.progress?.warnings || 0);
  const failed = Number(lifecycle.progress?.failed || 0);
  const skipped = Number(lifecycle.progress?.skipped || 0);
  const pendingSteps = totalSteps - completed;
  const reviewCount = warnings + failed;

  const selectedStep = steps.find((step) => step.key === selectedStepKey);
  const problemStepKey = problemStep?.key || "";

  return (
    <div className="space-y-5">
      <section className="border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
              Estado general
            </p>

            <h3 className="mt-2 text-2xl font-black text-slate-950">
              {problemStep
                ? "Hay un punto que revisar"
                : lifecycle.flowHealthy
                ? "Todo va bien"
                : "Flujo en revisión"}
            </h3>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              {problemStep
                ? `El flujo necesita atención en: ${getReadableStepTitle(
                    problemStep
                  )}.`
                : lifecycle.flowHealthy
                ? "La reservación avanzó correctamente en sus pasos principales."
                : lifecycle.message ||
                  "La reservación necesita revisión en uno o más pasos."}
            </p>
          </div>

          <div className="border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
              Avance
            </p>
            <p className="mt-1 text-3xl font-black text-slate-950">
              {percentage}%
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 bg-slate-100">
            <div
              className={[
                "h-full transition-all",
                problemStep
                  ? isFailedStep(problemStep)
                    ? "bg-red-500"
                    : "bg-amber-500"
                  : "bg-emerald-500",
              ].join(" ")}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500">
            <span>
              {completed} de {totalSteps} pasos completados
            </span>
            <span>Folio: {lifecycle.folio || "Sin folio"}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryBox label="Completados" value={completed} tone="success" />

        <SummaryBox
          label="Pendientes"
          value={pendingSteps < 0 ? 0 : pendingSteps}
        />

        <SummaryBox
          label="Por revisar"
          value={reviewCount}
          tone={reviewCount > 0 ? "warning" : "default"}
        />

        <SummaryBox label="Omitidos" value={skipped} />
      </section>

      <BreakpointCard
        problemStep={problemStep}
        nextPendingStep={nextPendingStep}
      />

      <FlowMap
        steps={steps}
        selectedStepKey={selectedStepKey}
        problemStepKey={problemStepKey}
        onSelect={setSelectedStepKey}
      />

      <SelectedStepInsight step={selectedStep} />

      <section className="border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              Árbol de línea de tiempo
            </p>

            <h3 className="mt-1 text-xl font-black text-slate-950">
              Dónde avanzó y dónde se detuvo
            </h3>
          </div>

          <span className="border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
            {steps.length} pasos
          </span>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <TreeNode
              key={`${step.order}-${step.key}`}
              step={step}
              isCurrent={step.key === currentStepKey}
              isSelected={step.key === selectedStepKey}
              isLast={index === steps.length - 1}
              onSelect={setSelectedStepKey}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
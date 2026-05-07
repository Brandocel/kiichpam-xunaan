"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { toast, Toaster } from "sonner";
import {
  AlertTriangle,
  BadgeCheck,
  Info,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

type BookingPromotionFeedbackVariant =
  | "success"
  | "info"
  | "warning"
  | "error";

interface BookingPromotionFeedbackProps {
  title: string;
  message: string;
  variant?: BookingPromotionFeedbackVariant;
  onClose?: () => void;

  /**
   * Tiempo para cerrar automáticamente.
   * Usa 0 si no quieres autocierre.
   */
  autoCloseMs?: number;

  /**
   * Muestra la barra inferior de progreso/carga.
   */
  showProgress?: boolean;

  /**
   * Se deja para no romper llamadas existentes.
   * Con Sonner se muestra como toast.
   */
  inline?: boolean;
}

const variantStyles: Record<
  BookingPromotionFeedbackVariant,
  {
    accent: string;
    iconBg: string;
    icon: ReactNode;
    title: string;
    text: string;
    progress: string;
    border: string;
    glow: string;
    softBg: string;
  }
> = {
  success: {
    accent: "#16A34A",
    iconBg: "bg-[#16A34A]",
    icon: <BadgeCheck size={20} strokeWidth={2.55} />,
    title: "text-[#0F6B34]",
    text: "text-[#395F47]",
    progress: "bg-[#16A34A]",
    border: "border-[#BFE8CC]",
    glow: "shadow-[0_14px_34px_rgba(22,163,74,0.16)]",
    softBg: "bg-[linear-gradient(135deg,#F7FFF9_0%,#ECFFF4_100%)]",
  },
  info: {
    accent: "#005F74",
    iconBg: "bg-[#005F74]",
    icon: <Info size={20} strokeWidth={2.55} />,
    title: "text-[#005F74]",
    text: "text-[#416773]",
    progress: "bg-[#005F74]",
    border: "border-[#BBDDEA]",
    glow: "shadow-[0_14px_34px_rgba(0,95,116,0.15)]",
    softBg: "bg-[linear-gradient(135deg,#F6FCFF_0%,#EAF8FC_100%)]",
  },
  warning: {
    accent: "#D97706",
    iconBg: "bg-[#D97706]",
    icon: <AlertTriangle size={20} strokeWidth={2.55} />,
    title: "text-[#B45309]",
    text: "text-[#765526]",
    progress: "bg-[#D97706]",
    border: "border-[#F3D4A9]",
    glow: "shadow-[0_14px_34px_rgba(217,119,6,0.18)]",
    softBg: "bg-[linear-gradient(135deg,#FFF9F1_0%,#FFF2E4_100%)]",
  },
  error: {
    accent: "#D92D20",
    iconBg: "bg-[#D92D20]",
    icon: <XCircle size={20} strokeWidth={2.55} />,
    title: "text-[#B42318]",
    text: "text-[#7A3D46]",
    progress: "bg-[#D92D20]",
    border: "border-[#F4C4CC]",
    glow: "shadow-[0_14px_34px_rgba(217,45,32,0.18)]",
    softBg: "bg-[linear-gradient(135deg,#FFF6F7_0%,#FFF0F2_100%)]",
  },
};

function BookingToastContent({
  title,
  message,
  variant,
  toastId,
  onClose,
  autoCloseMs,
  showProgress,
}: {
  title: string;
  message: string;
  variant: BookingPromotionFeedbackVariant;
  toastId: string | number;
  onClose?: () => void;
  autoCloseMs: number;
  showProgress: boolean;
}) {
  const styles = variantStyles[variant];

  function handleClose() {
    toast.dismiss(toastId);
    onClose?.();
  }

  return (
    <div
      className={[
        "kiichpam-toast-card",
        "relative w-full overflow-hidden rounded-[10px] border",
        "px-4 py-4 pr-11 sm:px-5 sm:py-4 sm:pr-12",
        "backdrop-blur-xl",
        styles.softBg,
        styles.border,
        styles.glow,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute right-[-48px] top-[-58px] h-[118px] w-[118px] rounded-full bg-white/45" />
      <div className="pointer-events-none absolute bottom-[-78px] left-[-62px] h-[145px] w-[145px] rounded-full bg-white/28" />

      <div className="relative flex items-start gap-3.5">
        <div
          className={[
            "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[8px] text-white",
            "shadow-[0_10px_22px_rgba(0,0,0,0.16)]",
            styles.iconBg,
          ].join(" ")}
        >
          {styles.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles
              size={13}
              strokeWidth={2.4}
              style={{ color: styles.accent }}
            />

            <span
              className={[
                "font-[var(--font-be-vietnam-pro)] text-[10.5px] font-black uppercase tracking-[0.12em]",
                styles.title,
              ].join(" ")}
            >
              Kiichpam Xunáan
            </span>
          </div>

          <p
            className={[
              "font-[var(--font-be-vietnam-pro)] text-[15px] font-black leading-[1.2] sm:text-[16px]",
              styles.title,
            ].join(" ")}
          >
            {title}
          </p>

          <p
            className={[
              "mt-1.5 font-[var(--font-be-vietnam-pro)] text-[13px] font-medium leading-[1.5] sm:text-[14px]",
              styles.text,
            ].join(" ")}
          >
            {message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        aria-label="Cerrar mensaje"
        className="
          absolute right-3 top-3
          flex h-[28px] w-[28px] items-center justify-center
          rounded-[6px]
          bg-white/70
          text-[#52616B]
          shadow-[0_7px_15px_rgba(0,0,0,0.07)]
          transition
          hover:scale-105 hover:bg-white hover:text-[#111827]
          active:scale-95
        "
      >
        <X size={15} strokeWidth={2.7} />
      </button>

      {showProgress && autoCloseMs > 0 ? (
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-black/5">
          <div
            className={[
              "h-full w-full origin-left rounded-r-[3px]",
              styles.progress,
              "animate-[kiichpamToastProgress_linear_forwards]",
            ].join(" ")}
            style={{
              animationDuration: `${autoCloseMs}ms`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function BookingPromotionFeedback({
  title,
  message,
  variant = "info",
  onClose,
  autoCloseMs = 6500,
  showProgress = true,
}: BookingPromotionFeedbackProps) {
  const toastIdRef = useRef<string | number | null>(null);

  const toastKey = useMemo(() => {
    return `${variant}-${title}-${message}`;
  }, [variant, title, message]);

  useEffect(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

    const id = toast.custom(
      (toastId) => (
        <BookingToastContent
          title={title}
          message={message}
          variant={variant}
          toastId={toastId}
          onClose={onClose}
          autoCloseMs={autoCloseMs}
          showProgress={showProgress}
        />
      ),
      {
        duration: autoCloseMs > 0 ? autoCloseMs : Infinity,
        position: "top-right",
        className: "kiichpam-booking-toast",
      }
    );

    toastIdRef.current = id;

    let closeTimer: number | null = null;

    if (autoCloseMs > 0 && onClose) {
      closeTimer = window.setTimeout(() => {
        onClose();
      }, autoCloseMs);
    }

    return () => {
      if (closeTimer !== null) {
        window.clearTimeout(closeTimer);
      }

      toast.dismiss(id);
    };
  }, [toastKey, title, message, variant, autoCloseMs, showProgress, onClose]);

  return (
    <>
      <Toaster
        position="top-right"
        visibleToasts={3}
        closeButton={false}
        richColors={false}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "w-[calc(100vw-24px)] sm:w-[430px] !p-0 !m-0 !bg-transparent !border-0 !shadow-none",
          },
        }}
      />

      <style jsx global>{`
        @keyframes kiichpamToastProgress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }

        @keyframes kiichpamToastSlideIn {
          0% {
            opacity: 0;
            transform: translate3d(34px, 0, 0) scale(0.985);
          }

          70% {
            opacity: 1;
            transform: translate3d(-4px, 0, 0) scale(1);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes kiichpamToastMobileSlideIn {
          0% {
            opacity: 0;
            transform: translate3d(0, -16px, 0) scale(0.985);
          }

          70% {
            opacity: 1;
            transform: translate3d(0, 3px, 0) scale(1);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .kiichpam-toast-card {
          animation: kiichpamToastSlideIn 360ms
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        [data-sonner-toaster] {
          z-index: 10080 !important;
        }

        [data-sonner-toast] {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }

        @media (max-width: 640px) {
          .kiichpam-toast-card {
            animation-name: kiichpamToastMobileSlideIn;
            border-radius: 10px !important;
          }

          [data-sonner-toaster][data-position="top-right"] {
            left: 12px !important;
            right: 12px !important;
            top: 12px !important;
            align-items: center !important;
          }

          [data-sonner-toast] {
            width: calc(100vw - 24px) !important;
          }
        }
      `}</style>
    </>
  );
}
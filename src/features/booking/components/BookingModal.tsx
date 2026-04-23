"use client";

import { useEffect } from "react";
import type { PackageItem } from "@/features/home/types/home.types";
import BookingSection from "./BookingSection";

interface BookingModalProps {
  isOpen: boolean;
  locale: "es" | "en";
  packages: PackageItem[];
  initialPackageCode?: string;
  onClose: () => void;
}

export default function BookingModal({
  isOpen,
  locale,
  packages,
  initialPackageCode = "",
  onClose,
}: BookingModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(0,0,0,0.58)] px-3 py-4 md:px-6 md:py-8"
      onClick={onClose}
    >
      <div
        className="relative max-h-[95vh] w-full max-w-[1380px] overflow-y-auto rounded-none bg-[#F3F3F3] shadow-[0_24px_70px_rgba(0,0,0,0.38)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={locale === "es" ? "Cerrar reservación" : "Close booking"}
          className="absolute right-4 top-4 z-30 flex h-[34px] w-[34px] items-center justify-center bg-transparent text-[30px] font-light leading-none text-[#005F74] shadow-none transition duration-200 hover:scale-[1.08] hover:text-[#C028B9]"
        >
          ×
        </button>

        <BookingSection
          locale={locale}
          packages={packages}
          initialPackageCode={initialPackageCode}
          isModal
          onClose={onClose}
        />
      </div>
    </div>
  );
}
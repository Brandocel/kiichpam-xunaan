"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleFlag } from "react-circle-flags";

interface LanguageSwitcherProps {
  locale: "es" | "en";
  className?: string;
}

export default function LanguageSwitcher({
  locale,
  className = "",
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [selected, setSelected] = useState<"es" | "en">(locale);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isChangingRef = useRef(false);

  useEffect(() => {
    setSelected(locale);
  }, [locale]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const buildNextPath = (nextLocale: "es" | "en") => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments[0] === "es" || segments[0] === "en") {
      segments[0] = nextLocale;
    } else {
      segments.unshift(nextLocale);
    }

    return `/${segments.join("/")}`;
  };

  const handleSelect = (nextLocale: "es" | "en") => {
    if (nextLocale === locale) return;
    if (isChangingRef.current) return;

    isChangingRef.current = true;
    setSelected(nextLocale);

    timeoutRef.current = setTimeout(() => {
      router.push(buildNextPath(nextLocale), { scroll: false });
      isChangingRef.current = false;
    }, 180);
  };

  return (
    <div
      className={[
        "relative inline-flex h-9 w-[112px] shrink-0 items-center overflow-hidden rounded-full",
        "border border-white/15 bg-[#243c88]/95 p-1 backdrop-blur-md",
        "shadow-[0_8px_20px_rgba(0,0,0,0.18)]",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-1 left-1 z-0 h-7 w-[50px] rounded-full bg-white",
          "shadow-[0_4px_14px_rgba(0,0,0,0.14)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          selected === "es" ? "translate-x-0" : "translate-x-[54px]",
        ].join(" ")}
      />

      <button
        type="button"
        onClick={() => handleSelect("es")}
        className="relative z-10 flex h-7 w-[50px] items-center justify-center gap-1 rounded-full"
        aria-label="Cambiar a español"
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full">
          <CircleFlag countryCode="mx" height="16" />
        </span>

        <span
          className={[
            "text-[10px] font-semibold leading-none transition-colors duration-200",
            selected === "es" ? "text-[#243c88]" : "text-white",
          ].join(" ")}
        >
          ES
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect("en")}
        className="relative z-10 flex h-7 w-[50px] items-center justify-center gap-1 rounded-full"
        aria-label="Change to English"
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full">
          <CircleFlag countryCode="us" height="16" />
        </span>

        <span
          className={[
            "text-[10px] font-semibold leading-none transition-colors duration-200",
            selected === "en" ? "text-[#243c88]" : "text-white",
          ].join(" ")}
        >
          EN
        </span>
      </button>
    </div>
  );
}
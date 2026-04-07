"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface LanguageSwitcherProps {
  locale: "es" | "en";
  className?: string;
  mobile?: boolean;
}

export default function LanguageSwitcher({
  locale,
  className = "",
  mobile = false,
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
    }, 130);
  };

  const textSize = mobile ? "text-[15px]" : "text-[14px]";
  const underlineWidth = mobile ? "w-7" : "w-6";

  return (
    <div
      className={[
        "group inline-flex items-center gap-3",
        mobile ? "gap-4" : "gap-3",
        className,
      ].join(" ")}
      aria-label="Selector de idioma"
    >
      <button
        type="button"
        onClick={() => handleSelect("es")}
        aria-label="Cambiar a español"
        className="relative flex flex-col items-center justify-center"
      >
        <span
          className={[
            "uppercase leading-none tracking-[0.14em] transition-all duration-200",
            textSize,
            selected === "es"
              ? "font-semibold text-white"
              : "font-medium text-white/65 hover:text-white/90",
          ].join(" ")}
        >
          ES
        </span>

        <span
          className={[
            "mt-1.5 h-[2px] rounded-full bg-white transition-all duration-300 ease-out",
            underlineWidth,
            selected === "es"
              ? "scale-100 opacity-100"
              : "scale-50 opacity-30 hover:scale-90 hover:opacity-70",
          ].join(" ")}
        />
      </button>

      <span className="translate-y-[-1px] text-white/45">/</span>

      <button
        type="button"
        onClick={() => handleSelect("en")}
        aria-label="Change to English"
        className="relative flex flex-col items-center justify-center"
      >
        <span
          className={[
            "uppercase leading-none tracking-[0.14em] transition-all duration-200",
            textSize,
            selected === "en"
              ? "font-semibold text-white"
              : "font-medium text-white/65 hover:text-white/90",
          ].join(" ")}
        >
          EN
        </span>

        <span
          className={[
            "mt-1.5 h-[2px] rounded-full bg-white transition-all duration-300 ease-out",
            underlineWidth,
            selected === "en"
              ? "scale-100 opacity-100"
              : "scale-50 opacity-30 hover:scale-90 hover:opacity-70",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
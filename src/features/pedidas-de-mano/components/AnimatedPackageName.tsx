"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface AnimatedPackageNameProps {
  name: string;
  active?: boolean;
  locale?: "es" | "en";
  className?: string;
}

const packageTranslations = [
  {
    variants: ["Yaakun"],
    es: "Amor",
    en: "Love",
  },
  {
    variants: ["Kuxtal"],
    es: "Vida",
    en: "Life",
  },
  {
    variants: ["Tuukul"],
    es: "Pensamiento",
    en: "Thought",
  },
  {
    variants: ["Ka’anal", "Ka'anal", "Ka´anal", "Kaanal"],
    es: "Cielo",
    en: "Sky",
  },
];

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/´/g, "'");
}

function getPackageTranslation(name: string, locale: "es" | "en") {
  const normalizedName = normalizeText(name);

  const found = packageTranslations.find((item) =>
    item.variants.some((variant) => normalizeText(variant) === normalizedName)
  );

  if (!found) return name;

  return locale === "es" ? found.es : found.en;
}

export default function AnimatedPackageName({
  name,
  active = false,
  locale = "es",
  className = "",
}: AnimatedPackageNameProps) {
  const originalName = name || "";
  const currentTextRef = useRef(originalName);
  const [displayText, setDisplayText] = useState(originalName);

  const translatedName = useMemo(() => {
    return getPackageTranslation(originalName, locale);
  }, [originalName, locale]);

  const hasTranslation = translatedName !== originalName;
  const targetText = active && hasTranslation ? translatedName : originalName;

  useEffect(() => {
    currentTextRef.current = originalName;
    setDisplayText(originalName);
  }, [originalName]);

  useEffect(() => {
    const fromText = currentTextRef.current;

    if (fromText === targetText) return;

    let index = 0;
    const maxLength = Math.max(fromText.length, targetText.length);

    const interval = window.setInterval(() => {
      index += 1;

      const nextText =
        targetText.slice(0, index) +
        (index < fromText.length ? fromText.slice(index) : "");

      currentTextRef.current = nextText;
      setDisplayText(nextText);

      if (index >= maxLength) {
        currentTextRef.current = targetText;
        setDisplayText(targetText);
        window.clearInterval(interval);
      }
    }, 35);

    return () => {
      window.clearInterval(interval);
    };
  }, [targetText]);

  return (
    <span
      className={["inline-flex items-center", className].join(" ")}
      title={hasTranslation ? `${originalName} = ${translatedName}` : name}
    >
      <span>{displayText}</span>

      {hasTranslation && (
        <span
          aria-hidden="true"
          className={[
            "ml-[2px] inline-block translate-y-[-1px]",
            active ? "opacity-100 animate-pulse" : "opacity-0",
          ].join(" ")}
        >
          |
        </span>
      )}
    </span>
  );
}
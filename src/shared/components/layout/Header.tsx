"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { navigation } from "../../config/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

interface HeaderProps {
  locale?: "es" | "en";
  variant?: "solid" | "overlay";
}

export default function Header({
  locale = "es",
  variant = "overlay",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOverlay = variant === "overlay";

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className={[
          "left-0 top-0 z-40 w-full",
          isOverlay ? "absolute" : "relative",
          isOverlay
            ? "bg-gradient-to-b from-[#C028B9]/75 via-[#A62FA3]/40 via-[48%] to-transparent"
            : "bg-[linear-gradient(180deg,#C028B9_0%,#5A1357_100%)]",
        ].join(" ")}
      >
        <div className="mx-auto flex h-[150px] w-full max-w-[1800px] items-center justify-between px-6 sm:h-[160px] sm:px-8 md:h-[170px] md:px-12 xl:h-[180px] xl:px-20">
          <Link
            href={`/${locale}`}
            className="relative z-10 flex shrink-0 items-center"
            onClick={closeMenu}
          >
            <div className="relative h-[96px] w-[96px] sm:h-[108px] sm:w-[108px] md:h-[120px] md:w-[120px] xl:h-[132px] xl:w-[132px]">
              <Image
                src="/KXXNlogo.svg"
                alt="Kiichpam Xunaan"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 640px) 96px, (max-width: 768px) 108px, (max-width: 1280px) 120px, 132px"
              />
            </div>
          </Link>

          <div className="flex items-center gap-3 md:gap-6 xl:gap-10">
            <nav className="relative z-10 hidden items-center gap-10 lg:flex xl:gap-12">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className="font-[var(--font-poppins)] text-[20px] font-medium leading-none text-white transition-opacity duration-200 hover:opacity-80 xl:text-[24px]"
                >
                  {item.label[locale]}
                </Link>
              ))}
            </nav>

            <div className="relative z-10 hidden lg:block">
              <LanguageSwitcher locale={locale} />
            </div>

            <button
              type="button"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
              className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 lg:hidden"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <div
        onClick={closeMenu}
        className={[
          "fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-all duration-300 lg:hidden",
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed right-0 top-0 z-50 h-full w-[82%] max-w-[340px] bg-[linear-gradient(180deg,#C028B9_0%,#5A1357_100%)] shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/15 px-5 py-5">
            <span className="font-[var(--font-poppins)] text-[28px] font-semibold text-white">
              Menú
            </span>

            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={closeMenu}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-white/20"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col px-5 py-6">
            <div className="flex flex-col gap-3">
              {navigation.map((item, index) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  onClick={closeMenu}
                  className="group rounded-xl px-4 py-3 text-white transition-all duration-300 hover:bg-white/10"
                  style={{
                    transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                  }}
                >
                  <span
                    className={[
                      "block font-[var(--font-poppins)] text-[20px] font-medium transition-all duration-300",
                      mobileMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-5 opacity-0",
                    ].join(" ")}
                  >
                    {item.label[locale]}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-auto border-t border-white/15 pt-5">
              <p className="mb-3 font-[var(--font-poppins)] text-sm text-white/80">
                Idioma
              </p>
              <LanguageSwitcher locale={locale} mobile />
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
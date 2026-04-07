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

  const isSolid = variant === "solid";
  const isOverlay = variant === "overlay";

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

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
          isSolid
            ? "bg-[#B336B2]"
            : "bg-gradient-to-b from-[#C028B9]/90 via-[#A62FA3]/55 to-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex h-[110px] w-full max-w-[1800px] items-center justify-between px-4 sm:px-6 md:px-10 xl:px-16">
          <Link
            href={`/${locale}`}
            className="relative z-10 flex shrink-0 items-center"
            onClick={closeMenu}
          >
            <Image
              src="/KXXNlogo.svg"
              alt="Kiichpam Xunaan"
              width={311}
              height={175}
              priority
              className="h-auto w-[130px] sm:w-[150px] md:w-[190px] xl:w-[230px]"
            />
          </Link>

          <div className="flex items-center gap-3 md:gap-6 xl:gap-10">
            {/* Navegación desktop */}
            <nav className="relative z-10 hidden items-center gap-8 lg:flex xl:gap-12">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className="text-[18px] font-medium leading-none text-white transition-opacity duration-200 hover:opacity-80 xl:text-[22px]"
                >
                  {item.label[locale]}
                </Link>
              ))}
            </nav>

            {/* Switcher solo desktop */}
            <div className="relative z-10 hidden lg:block">
              <LanguageSwitcher locale={locale} />
            </div>

            {/* Botón menú solo mobile */}
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

      {/* Fondo oscuro */}
      <div
        onClick={closeMenu}
        className={[
          "fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-all duration-300 lg:hidden",
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* Menú lateral mobile */}
      <aside
        className={[
          "fixed right-0 top-0 z-50 h-full w-[82%] max-w-[340px] bg-gradient-to-b from-[#B326AF] to-[#9B1F99] shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          {/* Header panel */}
          <div className="flex items-center justify-between border-b border-white/15 px-5 py-5">
            <span className="text-[28px] font-semibold text-white">Menú</span>

            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={closeMenu}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-white/20"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navegación */}
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
                      "block text-[18px] font-medium transition-all duration-300",
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

            {/* Switcher solo mobile dentro del menú */}
            <div className="mt-auto border-t border-white/15 pt-5">
              <p className="mb-3 text-sm text-white/80">Idioma</p>
              <LanguageSwitcher locale={locale} mobile />
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
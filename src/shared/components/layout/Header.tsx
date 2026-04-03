import Link from "next/link";
import Image from "next/image";
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
  const isSolid = variant === "solid";
  const isOverlay = variant === "overlay";

  return (
    <header
      className={[
        "left-0 top-0 z-30 w-full",
        isOverlay ? "absolute" : "relative",
        isSolid
          ? "bg-[#B336B2]"
          : "bg-gradient-to-b from-[#C028B9]/90 via-[#A62FA3]/55 to-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-[110px] w-full max-w-[1800px] items-center justify-between px-6 md:px-10 xl:px-16">
        <Link
          href={`/${locale}`}
          className="relative z-10 flex shrink-0 items-center"
        >
          <Image
            src="/KXXNlogo.svg"
            alt="Kiichpam Xunaan"
            width={311}
            height={175}
            priority
            className="h-auto w-[150px] md:w-[190px] xl:w-[230px]"
          />
        </Link>

        <div className="flex items-center gap-4 md:gap-6 xl:gap-10">
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

          <div className="relative z-10">
          <LanguageSwitcher locale={locale} className="ml-2" />
          </div>
        </div>
      </div>
    </header>
  );
}
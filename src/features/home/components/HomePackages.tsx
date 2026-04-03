import Image from "next/image";
import Link from "next/link";
import patternBg from "../../../assets/Linemorada.webp";
import type { PackageItem } from "../types/home.types";
import { buildMediaUrl } from "../../../shared/lib/utils";

interface HomePackagesProps {
  packages: PackageItem[];
  locale: "es" | "en";
}

const packageImageMap: Record<string, string> = {
  KX_BASIC: "/packages/kx-basic.webp",
  KX_PLUS: "/packages/kx-plus.webp",
  KX_TOTAL: "/packages/kx-total.webp",
};

function formatPrice(price: number) {
  return `$${(price / 100).toFixed(2)}`;
}

function getSectionTitle(locale: "es" | "en") {
  return locale === "es" ? "Elije tu paquete" : "Choose your package";
}

function getReserveText(locale: "es" | "en") {
  return locale === "es" ? "RESERVA AHORA" : "BOOK NOW";
}

function getAdultLabel(item: PackageItem, locale: "es" | "en") {
  return locale === "es"
    ? `Adulto (+${item.ageRules.adultMin} Años)`
    : `Adult (${item.ageRules.adultMin}+ Years)`;
}

function getCardImage(item: PackageItem) {
  if (item.image) {
    return buildMediaUrl(item.image);
  }

  return packageImageMap[item.code] || "/packages/kx-basic.webp";
}

function getReserveHref(locale: "es" | "en", packageCode: string) {
  return `/${locale}/reservar?packageCode=${encodeURIComponent(packageCode)}`;
}

export default function HomePackages({
  packages,
  locale,
}: HomePackagesProps) {
  if (!packages.length) return null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#483289_0%,#005F74_100%)]">
      <div
        className="absolute inset-x-0 top-0 h-[190px] bg-repeat-x bg-top"
        style={{
          backgroundImage: `url(${patternBg.src})`,
          backgroundSize: "auto 190px",
        }}
      />

      <div className="relative mx-auto max-w-[1380px] px-5 pb-20 pt-8 md:px-8 md:pb-24 md:pt-10 xl:px-10">
        <h2 className="mb-8 text-center font-[var(--font-be-vietnam-pro)] text-[clamp(2.4rem,4vw,4.7rem)] font-black leading-none text-white md:mb-12">
          {getSectionTitle(locale)}
        </h2>

        <div className="grid grid-cols-1 justify-items-center gap-8 xl:grid-cols-3 xl:gap-10">
          {packages.map((item) => {
            const noteText = item.translation.notes.join(" ");
            const imageSrc = getCardImage(item);

            return (
              <article
                key={item.id}
                className="flex min-h-[780px] w-full max-w-[390px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_12px_25px_rgba(0,0,0,0.28)]"
              >
                <div className="relative h-[220px] w-full overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={item.translation.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col px-7 pb-6 pt-4">
                  <h3 className="min-h-[98px] font-[var(--font-be-vietnam-pro)] text-[clamp(2rem,2.2vw,3.05rem)] font-black leading-[0.95] text-[#C028B9]">
                    {item.translation.name}
                  </h3>

                  <div className="mt-5 min-h-[250px]">
                    <ul className="list-disc space-y-1 pl-5 font-[var(--font-be-vietnam-pro)] text-[15px] font-normal leading-[1.25] text-[#111111]">
                      {item.translation.includes.map((include, index) => (
                        <li key={`${item.id}-include-${index}`}>{include}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="min-h-[52px] pt-8 font-[var(--font-be-vietnam-pro)] text-[11px] font-normal leading-[1.25] text-[#111111]">
                    {noteText}
                  </p>

                  <div className="mt-auto pt-6">
                    <p className="font-[var(--font-be-vietnam-pro)] text-[11px] font-normal leading-[24px] text-[#111111]">
                      {getAdultLabel(item, locale)}
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                      <span className="font-[var(--font-poppins)] text-[40px] font-bold leading-none text-[#C028B9]">
                        {formatPrice(item.adultPriceMXN)}
                      </span>
                      <span className="pb-[6px] font-[var(--font-poppins)] text-[20px] font-bold leading-none text-[#C028B9]">
                        {item.currency}
                      </span>
                    </div>

                    <Link
                      href={getReserveHref(locale, item.code)}
                      className="mt-4 flex h-[42px] w-full items-center justify-center rounded-[8px] bg-[#C028B9] font-[var(--font-be-vietnam-pro)] text-[14px] font-black uppercase tracking-[0] text-white transition hover:opacity-90"
                    >
                      {getReserveText(locale)}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
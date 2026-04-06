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

      <div className="relative mx-auto max-w-[1380px] px-3 pb-12 pt-6 sm:px-4 md:px-6 lg:px-8 xl:px-10 xl:pb-24 xl:pt-10">
        <h2 className="mb-6 text-center font-[var(--font-be-vietnam-pro)] text-[clamp(1.8rem,4vw,4.7rem)] font-black leading-none text-white md:mb-10">
          {getSectionTitle(locale)}
        </h2>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8">
          {packages.map((item) => {
            const noteText = item.translation.notes?.join(" ") ?? "";
            const imageSrc = getCardImage(item);

            return (
              <article
                key={item.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_10px_22px_rgba(0,0,0,0.22)]"
              >
                <div className="relative h-[95px] w-full overflow-hidden sm:h-[120px] md:h-[150px] lg:h-[190px] xl:h-[220px]">
                  <Image
                    src={imageSrc}
                    alt={item.translation.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 33vw"
                  />
                </div>

                <div className="flex flex-1 flex-col px-2 pb-3 pt-2 sm:px-3 sm:pb-4 sm:pt-3 md:px-4 lg:px-5 xl:px-7 xl:pb-6 xl:pt-4">
                  <h3 className="min-h-[44px] break-words font-[var(--font-be-vietnam-pro)] text-[clamp(0.8rem,1.7vw,3.05rem)] font-black leading-[1.02] text-[#C028B9] sm:min-h-[52px] md:min-h-[64px] lg:min-h-[78px] xl:min-h-[98px]">
                    {item.translation.name}
                  </h3>

                  <div className="mt-2 min-h-[150px] sm:min-h-[170px] md:min-h-[190px] lg:min-h-[220px] xl:mt-5 xl:min-h-[250px]">
                    <ul className="list-disc space-y-1 pl-4 font-[var(--font-be-vietnam-pro)] text-[clamp(0.52rem,1vw,0.95rem)] font-normal leading-[1.2] text-[#111111] sm:pl-5">
                      {item.translation.includes.map((include, index) => (
                        <li key={`${item.id}-include-${index}`} className="break-words">
                          {include}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="min-h-[38px] pt-3 font-[var(--font-be-vietnam-pro)] text-[clamp(0.45rem,0.85vw,0.7rem)] font-normal leading-[1.2] text-[#111111] sm:pt-4 md:min-h-[44px] xl:min-h-[52px] xl:pt-8">
                    {noteText}
                  </p>

                  <div className="mt-auto pt-3 xl:pt-6">
                    <p className="font-[var(--font-be-vietnam-pro)] text-[clamp(0.45rem,0.85vw,0.7rem)] font-normal leading-[1.2] text-[#111111] sm:leading-[1.3] md:leading-[1.4] xl:leading-[24px]">
                      {getAdultLabel(item, locale)}
                    </p>

                    <div className="mt-1 flex flex-wrap items-end gap-1 sm:gap-2">
                      <span className="font-[var(--font-poppins)] text-[clamp(0.95rem,2vw,2.5rem)] font-bold leading-none text-[#C028B9]">
                        {formatPrice(item.adultPriceMXN)}
                      </span>
                      <span className="pb-[2px] font-[var(--font-poppins)] text-[clamp(0.6rem,1.1vw,1.25rem)] font-bold leading-none text-[#C028B9] sm:pb-[4px] md:pb-[5px] xl:pb-[6px]">
                        {item.currency}
                      </span>
                    </div>

                    <Link
                      href={getReserveHref(locale, item.code)}
                      className="mt-3 flex h-[30px] w-full items-center justify-center rounded-[6px] bg-[#C028B9] px-1 text-center font-[var(--font-be-vietnam-pro)] text-[clamp(0.45rem,0.9vw,0.875rem)] font-black uppercase leading-none text-white transition hover:opacity-90 sm:h-[34px] md:h-[38px] lg:h-[40px] xl:mt-4 xl:h-[42px] xl:rounded-[8px]"
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
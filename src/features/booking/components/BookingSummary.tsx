"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, ChevronDown, UserRound } from "lucide-react";
import {
  SiVisa,
  SiMastercard,
  SiDiscover,
  SiAmericanexpress,
  SiPaypal,
} from "react-icons/si";
import type { IconType } from "react-icons";
import type { PackageItem } from "@/features/home/types/home.types";
import type {
  PaymentIntentData,
  PaymentMethodType,
  ReservationQuoteData,
} from "../types/booking.types";
import { formatHumanDate, formatMoney } from "../utils/booking-calculations";
import { buildMediaUrl } from "@/shared/lib/utils";

interface BookingSummaryProps {
  locale: "es" | "en";
  packages: PackageItem[];
  packageCode: string;
  visitDate: string;
  adults: number;
  children: number;
  infants: number;
  inapamVisitors: number;
  quote: ReservationQuoteData | null;
  couponCode: string;
  loadingQuote: boolean;
  loadingReservation: boolean;
  loadingContact: boolean;
  loadingPayment: boolean;
  canContinue: boolean;
  currentStep: 1 | 2 | 3 | 4;
  paymentMethod: PaymentMethodType;
  paymentIntent: PaymentIntentData | null;
  onCouponCodeChange: (value: string) => void;
  onPrimaryAction: () => void;
}

const fallbackImageMap: Record<string, string> = {
  KX_BASIC: "/packages/kx-basic.webp",
  KX_PLUS: "/packages/kx-plus.webp",
  KX_TOTAL: "/packages/kx-total.webp",
};

type PaymentLogoItem =
  | {
      key: string;
      type: "icon";
      label: string;
      Icon: IconType;
      iconClassName?: string;
      boxClassName?: string;
    }
  | {
      key: string;
      type: "image";
      label: string;
      src: string;
      imageClassName?: string;
      boxClassName?: string;
    };

const paymentLogos: PaymentLogoItem[] = [
  {
    key: "visa",
    type: "icon",
    label: "Visa",
    Icon: SiVisa,
    iconClassName: "text-[#1A1F71]",
    boxClassName: "w-[50px] md:w-[58px]",
  },
  {
    key: "mastercard",
    type: "icon",
    label: "Mastercard",
    Icon: SiMastercard,
    iconClassName: "text-[#EB001B]",
    boxClassName: "w-[50px] md:w-[58px]",
  },
  {
    key: "discover",
    type: "icon",
    label: "Discover",
    Icon: SiDiscover,
    iconClassName: "text-[#F58220]",
    boxClassName: "w-[62px] md:w-[74px]",
  },
  {
    key: "american-express",
    type: "icon",
    label: "American Express",
    Icon: SiAmericanexpress,
    iconClassName: "text-[#2E77BC]",
    boxClassName: "w-[50px] md:w-[58px]",
  },
  {
    key: "paypal",
    type: "icon",
    label: "PayPal",
    Icon: SiPaypal,
    iconClassName: "text-[#003087]",
    boxClassName: "w-[54px] md:w-[66px]",
  },
  {
    key: "oxxo",
    type: "image",
    label: "OXXO",
    src: "/logo/oxxo.png",
    imageClassName: "object-contain",
    boxClassName: "w-[50px] md:w-[58px]",
  },
];

function getText(locale: "es" | "en") {
  return locale === "es"
    ? {
        title: "Resumen de tu compra",
        promoPlaceholder: "Ingresa cupón de promoción",
        subtotal: "Subtotal",
        campaignDiscount: "Descuento campaña",
        inapam: "Descuento INAPAM",
        promo: "Descuento cupón",
        total: "Precio total",
        taxes: "Todos los impuestos incluidos",
        quote: "COTIZAR",
        continue: "CONTINUAR",
        preparePayment: "PREPARAR PAGO",
        confirmPayment: "CONFIRMAR PAGO",
        generateOxxo: "GENERAR REFERENCIA",
        loading: "COTIZANDO...",
        saving: "GUARDANDO...",
        accepts: "Aceptamos:",
        adult: "Adulto",
        adults: "Adultos",
        child: "Niño",
        children: "Niños",
        infant: "Infante",
        infants: "Infantes",
        inapamVisitor: "INAPAM",
        inapamVisitors: "INAPAM",
        free: "Gratis",
        defaultPackageName: "Nombre del paquete",
        pendingQuote: "Cotiza para ver el desglose completo de precios.",
      }
    : {
        title: "Purchase summary",
        promoPlaceholder: "Enter promo coupon",
        subtotal: "Subtotal",
        campaignDiscount: "Campaign discount",
        inapam: "INAPAM discount",
        promo: "Coupon discount",
        total: "Total price",
        taxes: "All taxes included",
        quote: "QUOTE",
        continue: "CONTINUE",
        preparePayment: "PREPARE PAYMENT",
        confirmPayment: "CONFIRM PAYMENT",
        generateOxxo: "GENERATE REFERENCE",
        loading: "QUOTING...",
        saving: "SAVING...",
        accepts: "We accept:",
        adult: "Adult",
        adults: "Adults",
        child: "Child",
        children: "Children",
        infant: "Infant",
        infants: "Infants",
        inapamVisitor: "INAPAM",
        inapamVisitors: "INAPAM",
        free: "Free",
        defaultPackageName: "Package name",
        pendingQuote: "Quote to see the complete price breakdown.",
      };
}

function getPeopleLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-full bg-[#D8D8D8] ${className}`} />
  );
}

function PaymentLogo({ item }: { item: PaymentLogoItem }) {
  const boxWidth = item.boxClassName ?? "w-[52px] md:w-[60px]";

  return (
    <div
      className={`flex h-[28px] shrink-0 items-center justify-center md:h-[32px] ${boxWidth}`}
    >
      {item.type === "icon" ? (
        <item.Icon
          aria-label={item.label}
          className={`h-[16px] w-auto md:h-[20px] ${item.iconClassName ?? ""}`}
        />
      ) : (
        <div className="relative h-[20px] w-full md:h-[24px]">
          <Image
            src={item.src}
            alt={item.label}
            fill
            className={item.imageClassName ?? "object-contain"}
            sizes="68px"
          />
        </div>
      )}
    </div>
  );
}

function PersonRow({
  label,
  value,
  previousValue,
  showPrice,
  loading,
  isFree,
  freeLabel,
}: {
  label: string;
  value?: string;
  previousValue?: string;
  showPrice: boolean;
  loading: boolean;
  isFree?: boolean;
  freeLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <UserRound
          size={18}
          strokeWidth={2.2}
          className="shrink-0 text-[#5A39A8]"
        />
        <span className="font-[var(--font-be-vietnam-pro)] text-[14px] font-medium text-[#005F74] md:text-[15px]">
          {label}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-end gap-2">
          <SkeletonLine className="h-[12px] w-[74px]" />
          <SkeletonLine className="h-[14px] w-[88px]" />
        </div>
      ) : showPrice ? (
        <div className="text-right font-[var(--font-be-vietnam-pro)]">
          {previousValue ? (
            <p className="text-[13px] font-medium text-[#005F74] line-through md:text-[15px]">
              {previousValue}
            </p>
          ) : null}

          <p className="text-[14px] font-black text-[#005F74] md:text-[15px]">
            {isFree ? freeLabel : value}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function BookingSummary({
  locale,
  packages,
  packageCode,
  visitDate,
  adults,
  children,
  infants,
  inapamVisitors,
  quote,
  couponCode,
  loadingQuote,
  loadingReservation,
  loadingContact,
  loadingPayment,
  canContinue,
  currentStep,
  paymentMethod,
  paymentIntent,
  onCouponCodeChange,
  onPrimaryAction,
}: BookingSummaryProps) {
  const t = getText(locale);
  const [subtotalOpen, setSubtotalOpen] = useState(true);

  const selectedPackage = packages.find((item) => item.code === packageCode);
  const hasQuote = Boolean(quote);

  const quoteCoverUrl = quote?.package?.coverMedia?.url;

  const imageSrc = quoteCoverUrl
    ? buildMediaUrl({ url: quoteCoverUrl } as any)
    : selectedPackage?.image
      ? buildMediaUrl(selectedPackage.image)
      : packageCode
        ? fallbackImageMap[packageCode] || "/packages/kx-basic.webp"
        : "/packages/kx-basic.webp";

  const name =
    quote?.snapshot?.name ||
    selectedPackage?.translation?.name ||
    t.defaultPackageName;

  const currency = quote?.package?.currency || selectedPackage?.currency || "MXN";

  const packageAdultPriceMXN =
    quote?.pricing?.adultPriceMXN ?? selectedPackage?.adultPriceMXN ?? 0;

  const packageChildPriceMXN =
    quote?.pricing?.childPriceMXN ?? selectedPackage?.childPriceMXN ?? 0;

  const packageInfantPriceMXN =
    quote?.pricing?.infantPriceMXN ?? selectedPackage?.infantPriceMXN ?? 0;

  const baseAdultTotal = packageAdultPriceMXN * adults;
  const baseChildTotal = packageChildPriceMXN * children;
  const baseInfantTotal = packageInfantPriceMXN * infants;

  const adultLineTotalBeforeInapam =
    quote?.pricing?.campaignAdultTotalMXN ?? baseAdultTotal;

  const childLineTotal =
    quote?.pricing?.campaignChildTotalMXN ?? baseChildTotal;

  const infantLineTotal =
    quote?.pricing?.campaignInfantTotalMXN ?? baseInfantTotal;

  const subtotalMXN =
    quote?.pricing?.subtotalMXN ??
    adultLineTotalBeforeInapam + childLineTotal + infantLineTotal;

  const campaignDiscountMXN = quote?.pricing?.campaignDiscountMXN ?? 0;
  const couponDiscountMXN = quote?.pricing?.couponDiscountMXN ?? 0;
  const inapamDiscountMXN = quote?.pricing?.inapamDiscountMXN ?? 0;
  const totalMXN = quote?.pricing?.totalMXN ?? subtotalMXN;

  const quoteInapamVisitors =
    quote?.pricing?.inapamVisitors ?? inapamVisitors ?? 0;

  const payableAdults = quote?.passengers?.payableAdults ?? adults;

  const effectiveAdultUnitPriceMXN =
    quote?.pricing?.effectiveAdultUnitPriceMXN ??
    (payableAdults > 0
      ? Math.floor(adultLineTotalBeforeInapam / payableAdults)
      : packageAdultPriceMXN);

  const inapamUnitPriceMXN =
    quote?.pricing?.inapamUnitPriceMXN ??
    (quoteInapamVisitors > 0
      ? Math.max(
          effectiveAdultUnitPriceMXN -
            Math.floor(inapamDiscountMXN / quoteInapamVisitors),
          0
        )
      : effectiveAdultUnitPriceMXN);

  const shouldSplitInapamLine = hasQuote && quoteInapamVisitors > 0;

  const regularAdultCount = shouldSplitInapamLine
    ? Math.max(adults - quoteInapamVisitors, 0)
    : adults;

  const regularAdultLineTotal = shouldSplitInapamLine
    ? regularAdultCount * effectiveAdultUnitPriceMXN
    : Math.max(adultLineTotalBeforeInapam - inapamDiscountMXN, 0);

  const inapamLineTotal = quoteInapamVisitors * inapamUnitPriceMXN;

  const hasRegularAdultCampaignDiscount =
    hasQuote &&
    regularAdultCount > 0 &&
    packageAdultPriceMXN > effectiveAdultUnitPriceMXN;

  const hasInapamDiscount =
    hasQuote &&
    quoteInapamVisitors > 0 &&
    effectiveAdultUnitPriceMXN > inapamUnitPriceMXN;

  const hasChildDiscount =
    hasQuote && baseChildTotal > 0 && childLineTotal < baseChildTotal;

  const hasInfantDiscount =
    hasQuote && baseInfantTotal > 0 && infantLineTotal < baseInfantTotal;

  const shouldShowCampaignDiscount = hasQuote && campaignDiscountMXN > 0;
  const shouldShowInapamDiscount = hasQuote && inapamDiscountMXN > 0;
  const shouldShowCouponDiscount = hasQuote && couponDiscountMXN > 0;

  const isBusy =
    loadingQuote || loadingReservation || loadingContact || loadingPayment;

  const mainButtonLabel = isBusy
    ? currentStep === 2
      ? t.saving
      : t.loading
    : currentStep === 1
      ? quote
        ? t.continue
        : t.quote
      : currentStep === 2
        ? t.continue
        : currentStep === 3
          ? paymentMethod === "card"
            ? paymentIntent?.stripe?.clientSecret
              ? t.confirmPayment
              : t.preparePayment
            : t.generateOxxo
          : t.continue;

  return (
    <aside className="w-full">
      <h3 className="mb-4 font-[var(--font-be-vietnam-pro)] text-[24px] font-black leading-none text-[#C028B9] md:text-[34px]">
        {t.title}
      </h3>

      <div className="flex gap-4">
        <div className="relative h-[80px] w-[80px] overflow-hidden rounded-[6px]">
          <Image src={imageSrc} alt={name} fill className="object-cover" />
        </div>

        <div className="flex-1">
          <h4 className="font-[var(--font-be-vietnam-pro)] text-[24px] font-black leading-tight text-[#005F74]">
            {name}
          </h4>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {regularAdultCount > 0 ? (
          <PersonRow
            label={getPeopleLabel(regularAdultCount, t.adult, t.adults)}
            value={formatMoney(regularAdultLineTotal, currency, locale)}
            previousValue={
              hasRegularAdultCampaignDiscount
                ? formatMoney(
                    regularAdultCount * packageAdultPriceMXN,
                    currency,
                    locale
                  )
                : undefined
            }
            showPrice={hasQuote}
            loading={loadingQuote}
            freeLabel={t.free}
          />
        ) : null}

        {shouldSplitInapamLine ? (
          <PersonRow
            label={getPeopleLabel(
              quoteInapamVisitors,
              t.inapamVisitor,
              t.inapamVisitors
            )}
            value={formatMoney(inapamLineTotal, currency, locale)}
            previousValue={
              hasInapamDiscount
                ? formatMoney(
                    quoteInapamVisitors * effectiveAdultUnitPriceMXN,
                    currency,
                    locale
                  )
                : undefined
            }
            showPrice={hasQuote}
            loading={loadingQuote}
            freeLabel={t.free}
          />
        ) : null}

        {children > 0 ? (
          <PersonRow
            label={getPeopleLabel(children, t.child, t.children)}
            value={formatMoney(childLineTotal, currency, locale)}
            previousValue={
              hasChildDiscount
                ? formatMoney(baseChildTotal, currency, locale)
                : undefined
            }
            showPrice={hasQuote}
            loading={loadingQuote}
            freeLabel={t.free}
          />
        ) : null}

        {infants > 0 ? (
          <PersonRow
            label={getPeopleLabel(infants, t.infant, t.infants)}
            value={formatMoney(infantLineTotal, currency, locale)}
            previousValue={
              hasInfantDiscount
                ? formatMoney(baseInfantTotal, currency, locale)
                : undefined
            }
            showPrice={hasQuote}
            loading={loadingQuote}
            isFree={infantLineTotal <= 0}
            freeLabel={t.free}
          />
        ) : null}

        {visitDate ? (
          <div className="flex items-center gap-3 pt-1">
            <CalendarDays
              size={18}
              strokeWidth={2.2}
              className="shrink-0 text-[#5A39A8]"
            />
            <span className="font-[var(--font-be-vietnam-pro)] text-[14px] font-medium text-[#005F74] md:text-[15px]">
              {formatHumanDate(visitDate, locale)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => onCouponCodeChange(e.target.value)}
          placeholder={t.promoPlaceholder}
          className="h-[40px] w-full rounded-[4px] border border-[#D6D6D6] bg-[#E9E9E9] px-3 font-[var(--font-be-vietnam-pro)] text-[13px] text-[#005F74] outline-none placeholder:text-[rgba(0,88,111,0.55)]"
        />
      </div>

      <div className="mt-8 font-[var(--font-be-vietnam-pro)] text-[15px]">
        {loadingQuote ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SkeletonLine className="h-[16px] w-[92px]" />
              <SkeletonLine className="h-[16px] w-[80px]" />
            </div>

            <div className="flex items-center justify-between">
              <SkeletonLine className="h-[14px] w-[150px]" />
              <SkeletonLine className="h-[14px] w-[70px]" />
            </div>

            <div className="pt-3">
              <div className="flex items-center justify-between">
                <SkeletonLine className="h-[24px] w-[130px]" />
                <SkeletonLine className="h-[24px] w-[100px]" />
              </div>
              <SkeletonLine className="mt-2 h-[10px] w-[140px]" />
            </div>
          </div>
        ) : hasQuote ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSubtotalOpen((prev) => !prev)}
              className="flex w-full items-center justify-between gap-4 font-bold text-[#005F74]"
            >
              <span>{t.subtotal}</span>

              <span className="flex items-center gap-2">
                <span>{formatMoney(subtotalMXN, currency, locale)}</span>
                <ChevronDown
                  size={18}
                  strokeWidth={2.5}
                  className={`text-[#56359A] transition-transform duration-200 ${
                    subtotalOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </span>
            </button>

            {subtotalOpen ? (
              <div className="space-y-3 pt-1">
                {shouldShowCampaignDiscount ? (
                  <div className="flex items-center justify-between text-[#6A6A6A]">
                    <span>{t.campaignDiscount}</span>
                    <span>
                      -{formatMoney(campaignDiscountMXN, currency, locale)}
                    </span>
                  </div>
                ) : null}

                {shouldShowInapamDiscount ? (
                  <div className="flex items-center justify-between text-[#6A6A6A]">
                    <span>{t.inapam}</span>
                    <span>
                      -{formatMoney(inapamDiscountMXN, currency, locale)}
                    </span>
                  </div>
                ) : null}

                {shouldShowCouponDiscount ? (
                  <div className="flex items-center justify-between text-[#6A6A6A]">
                    <span>{t.promo}</span>
                    <span>
                      -{formatMoney(couponDiscountMXN, currency, locale)}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="pt-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-[var(--font-be-vietnam-pro)] text-[22px] font-black leading-none text-[#005F74]">
                    {t.total}
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-[#005F74]">
                    {t.taxes}
                  </p>
                </div>

                <p className="font-[var(--font-be-vietnam-pro)] text-[22px] font-black leading-none text-[#005F74]">
                  {formatMoney(totalMXN, currency, locale)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[14px] font-medium text-[#005F74]">
            {t.pendingQuote}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onPrimaryAction}
        disabled={!canContinue || isBusy}
        className="
          mt-8 flex h-[44px] w-full items-center justify-center
          rounded-[999px]
          bg-[#C028B9]
          px-6
          font-[var(--font-be-vietnam-pro)]
          text-[13px] font-black tracking-[0.35em]
          text-white
          transition
          hover:brightness-110
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {mainButtonLabel}
      </button>

      <div className="mt-7">
        <p className="mb-3 font-[var(--font-be-vietnam-pro)] text-[16px] font-black text-[#C028B9]">
          {t.accepts}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {paymentLogos.map((item) => (
            <PaymentLogo key={item.key} item={item} />
          ))}
        </div>
      </div>
    </aside>
  );
}
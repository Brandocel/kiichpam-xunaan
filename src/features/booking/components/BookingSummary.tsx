"use client";

import Image from "next/image";
import { CalendarDays, UserRound } from "lucide-react";
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
import {
  formatHumanDate,
  formatMoney,
  needsBookingQuote,
} from "../utils/booking-calculations";
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
        promo: "Promoción",
        inapam: "Descuento INAPAM",
        total: "Precio total",
        taxes: "Todos los impuestos incluidos",
        quote: "COTIZAR",
        continue: "CONTINUAR",
        pay: "PAGAR",
        preparePayment: "PREPARAR PAGO",
        confirmPayment: "CONFIRMAR PAGO",
        generateOxxo: "GENERAR REFERENCIA",
        loading: "CARGANDO...",
        saving: "GUARDANDO...",
        accepts: "Aceptamos:",
        adult: "Adulto",
        adults: "Adultos",
        child: "Niño",
        children: "Niños",
        infant: "Infante",
        infants: "Infantes",
        free: "Gratis",
        inapamVisitors: "INAPAM",
        defaultPackageName: "Nombre del paquete",
      }
    : {
        title: "Purchase summary",
        promoPlaceholder: "Enter promo coupon",
        subtotal: "Subtotal",
        promo: "Promotion",
        inapam: "INAPAM Discount",
        total: "Total price",
        taxes: "All taxes included",
        quote: "QUOTE",
        continue: "CONTINUE",
        pay: "PAY",
        preparePayment: "PREPARE PAYMENT",
        confirmPayment: "CONFIRM PAYMENT",
        generateOxxo: "GENERATE REFERENCE",
        loading: "LOADING...",
        saving: "SAVING...",
        accepts: "We accept:",
        adult: "Adult",
        adults: "Adults",
        child: "Child",
        children: "Children",
        infant: "Infant",
        infants: "Infants",
        free: "Free",
        inapamVisitors: "INAPAM",
        defaultPackageName: "Package name",
      };
}

function getPeopleLabel(
  count: number,
  singular: string,
  plural: string
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function PersonPriceRow({
  label,
  value,
  isFree = false,
  freeLabel = "Gratis",
}: {
  label: string;
  value?: string;
  isFree?: boolean;
  freeLabel?: string;
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

      <span className="font-[var(--font-be-vietnam-pro)] text-[14px] font-black text-[#005F74] md:text-[15px]">
        {isFree ? freeLabel : value}
      </span>
    </div>
  );
}

function PaymentLogo({ item }: { item: PaymentLogoItem }) {
  const boxWidth = item.boxClassName ?? "w-[52px] md:w-[60px]";

  return (
    <div
      className={`shrink-0 ${boxWidth} h-[28px] md:h-[32px] flex items-center justify-center`}
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
  const selectedPackage = packages.find((item) => item.code === packageCode);

  const imageSrc = selectedPackage?.image
    ? buildMediaUrl(selectedPackage.image)
    : packageCode
      ? fallbackImageMap[packageCode] || "/packages/kx-basic.webp"
      : "/packages/kx-basic.webp";

  const name =
    quote?.snapshot?.name ||
    selectedPackage?.translation.name ||
    t.defaultPackageName;

  const currency =
    quote?.package?.currency || selectedPackage?.currency || "MXN";

  const adultUnitPrice =
    quote?.pricing?.adultPriceMXN ?? selectedPackage?.adultPriceMXN ?? 0;
  const childUnitPrice =
    quote?.pricing?.childPriceMXN ?? selectedPackage?.childPriceMXN ?? 0;

  const infantUnitPrice = 0;

  const adultLineTotal =
    quote?.pricing?.adultsTotalMXN ?? adultUnitPrice * adults;
  const childLineTotal =
    quote?.pricing?.childrenTotalMXN ?? childUnitPrice * children;
  const infantLineTotal =
    quote?.pricing?.infantsTotalMXN ?? infantUnitPrice * infants;

  const subtotalMXN =
    quote?.pricing?.subtotalMXN ??
    adultLineTotal + childLineTotal + infantLineTotal;

  const couponDiscountMXN = quote?.pricing?.couponDiscountMXN ?? 0;
  const inapamDiscountMXN = quote?.pricing?.inapamDiscountMXN ?? 0;
  const totalMXN = quote?.pricing?.totalMXN ?? subtotalMXN;

  const isBusy =
    loadingQuote || loadingReservation || loadingContact || loadingPayment;

  const shouldQuote = needsBookingQuote({
    couponCode,
    inapamVisitors,
  });

  const mainButtonLabel = isBusy
    ? currentStep === 2
      ? t.saving
      : t.loading
    : currentStep === 1
      ? shouldQuote
        ? quote
          ? t.continue
          : t.quote
        : t.continue
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
        {adults > 0 ? (
          <PersonPriceRow
            label={getPeopleLabel(adults, t.adult, t.adults)}
            value={formatMoney(adultLineTotal, currency, locale)}
          />
        ) : null}

        {children > 0 ? (
          <PersonPriceRow
            label={getPeopleLabel(children, t.child, t.children)}
            value={formatMoney(childLineTotal, currency, locale)}
          />
        ) : null}

        {infants > 0 ? (
          <PersonPriceRow
            label={getPeopleLabel(infants, t.infant, t.infants)}
            isFree
            freeLabel={t.free}
          />
        ) : null}

        {inapamVisitors > 0 ? (
          <PersonPriceRow
            label={`${inapamVisitors} ${t.inapamVisitors}`}
            value={`-${formatMoney(inapamDiscountMXN, currency, locale)}`}
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
          className="h-[40px] w-full rounded-[4px] border border-[#D6D6D6] bg-[#E9E9E9] px-3 font-[var(--font-be-vietnam-pro)] text-[13px] outline-none placeholder:text-[rgba(0,88,111,0.32)]"
        />
      </div>

      <div className="mt-8 space-y-3 font-[var(--font-be-vietnam-pro)] text-[15px]">
        <div className="flex items-center justify-between font-bold text-[#005F74]">
          <span>{t.subtotal}</span>
          <span>{formatMoney(subtotalMXN, currency, locale)}</span>
        </div>

        <div className="flex items-center justify-between text-[#6A6A6A]">
          <span>{t.promo}</span>
          <span>
            {couponDiscountMXN > 0
              ? `-${formatMoney(couponDiscountMXN, currency, locale)}`
              : formatMoney(0, currency, locale)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#6A6A6A]">
          <span>{t.inapam}</span>
          <span>
            {inapamDiscountMXN > 0
              ? `-${formatMoney(inapamDiscountMXN, currency, locale)}`
              : formatMoney(0, currency, locale)}
          </span>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between text-[22px] font-black text-[#005F74]">
            <span>{t.total}</span>
            <span>{formatMoney(totalMXN, currency, locale)}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#005F74]">{t.taxes}</p>
        </div>
      </div>

      {currentStep < 4 ? (
        <button
          type="button"
          onClick={onPrimaryAction}
          disabled={isBusy || !canContinue}
          className="mt-8 h-[44px] w-full rounded-full bg-[#C028B9] font-[var(--font-be-vietnam-pro)] text-[13px] font-black uppercase tracking-[0.28em] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mainButtonLabel}
        </button>
      ) : null}

<div className="mt-8">
  <p className="mb-2 font-[var(--font-be-vietnam-pro)] text-[16px] font-black leading-none text-[#C028B9] md:text-[18px]">
    {t.accepts}
  </p>

  <div className="overflow-x-auto">
    <div className="flex min-w-max flex-nowrap items-center gap-2.5 md:gap-3">
      {paymentLogos.map((item) => (
        <PaymentLogo key={item.key} item={item} />
      ))}
    </div>
  </div>
</div>
    </aside>
  );
}
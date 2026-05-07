"use client";

import { useMemo, useState } from "react";
import type { PackageItem } from "@/features/home/types/home.types";
import BookingModal from "@/features/booking/components/BookingModal";
import type { PromotionItem } from "../types/promotions.types";
import PromotionsHero from "./PromotionsHero";
import PromotionsSection from "./PromotionsSection";

interface PromotionsPageViewProps {
  locale: "es" | "en";
  packages: PackageItem[];
  featuredPromotion: PromotionItem | null;
  promotions: PromotionItem[];
}

type BookingPromotionState = {
  packageCode: string;
  campaignCode: string;
  campaignByPackageCode: Record<string, string>;
  adults: number;
  children: number;
  infants: number;
  notice: string;
};

const DEFAULT_PACKAGE_CODE = "KX_BASIC";

const promotionCampaignMap: Record<string, Record<string, string>> = {
  "PROMO-AMOR-MAS-NATURAL": {
    KX_BASIC: "AMOR-MAS-NATURAL-3X2",
    KX_PLUS: "AMOR-MAS-NATURAL-3X2",
    KX_TOTAL: "AMOR-MAS-NATURAL-3X2",
  },
  "AMOR-MAS-NATURAL-3X2": {
    KX_BASIC: "AMOR-MAS-NATURAL-3X2",
    KX_PLUS: "AMOR-MAS-NATURAL-3X2",
    KX_TOTAL: "AMOR-MAS-NATURAL-3X2",
  },
  "PROMO-PENINSULARES": {
    KX_BASIC: "PENINSULARES-KX-BASIC-99",
    KX_PLUS: "PENINSULARES-KX-PLUS-319",
    KX_TOTAL: "PENINSULARES-KX-TOTAL-546",
  },
  "PROMO-NACIONALES": {
    KX_BASIC: "NACIONALES-KX-BASIC-104",
    KX_PLUS: "NACIONALES-KX-PLUS-293",
    KX_TOTAL: "NACIONALES-KX-TOTAL-452",
  },
};

function getPromotionKey(promotion: PromotionItem) {
  const code = promotion.code?.trim().toUpperCase() || "";
  const campaignCode = promotion.campaign?.code?.trim().toUpperCase() || "";

  if (promotionCampaignMap[code]) return code;
  if (campaignCode && promotionCampaignMap[campaignCode]) return campaignCode;

  return code;
}

function getPromotionCampaignByPackage(promotion: PromotionItem) {
  const promotionKey = getPromotionKey(promotion);

  if (promotionCampaignMap[promotionKey]) {
    return promotionCampaignMap[promotionKey];
  }

  const directCampaignCode = promotion.campaign?.code?.trim().toUpperCase();

  if (directCampaignCode) {
    return {
      KX_BASIC: directCampaignCode,
      KX_PLUS: directCampaignCode,
      KX_TOTAL: directCampaignCode,
    };
  }

  const promotionCode = promotion.code?.trim().toUpperCase();

  if (promotionCode) {
    return {
      KX_BASIC: promotionCode,
      KX_PLUS: promotionCode,
      KX_TOTAL: promotionCode,
    };
  }

  return {};
}

function buildPromotionNotice(
  promotion: PromotionItem,
  locale: "es" | "en"
) {
  const code = promotion.code?.trim().toUpperCase() || "";
  const campaignCode = promotion.campaign?.code?.trim().toUpperCase() || "";
  const text = `${code} ${campaignCode} ${promotion.title ?? ""}`.toUpperCase();

  const isMotherPromo =
    text.includes("AMOR-MAS-NATURAL") ||
    text.includes("3X2") ||
    text.includes("MAM");

  const isPeninsularPromo = text.includes("PENINSULARES");
  const isNationalPromo = text.includes("NACIONALES");

  if (isMotherPromo) {
    return locale === "es"
      ? "Promoción 3x2 aplicada. Se precargaron 3 adultos. Para hacer válida esta promoción, una de las personas debe ser mamá."
      : "3x2 promotion applied. 3 adults were preloaded. To validate this promotion, one visitor must be a mom.";
  }

  if (isPeninsularPromo) {
    return locale === "es"
      ? "Promoción peninsular aplicada. Recuerda presentar identificación oficial vigente de Yucatán, Quintana Roo o Chetumal."
      : "Peninsular promotion applied. Please show a valid official ID from Yucatan, Quintana Roo or Chetumal.";
  }

  if (isNationalPromo) {
    return locale === "es"
      ? "Promoción nacional aplicada. Recuerda presentar identificación oficial vigente de México."
      : "National promotion applied. Please show a valid official Mexican ID.";
  }

  return locale === "es"
    ? "Promoción aplicada a esta reservación."
    : "Promotion applied to this booking.";
}

function buildPromotionBookingState(
  promotion: PromotionItem,
  locale: "es" | "en"
): BookingPromotionState {
  const campaignByPackageCode = getPromotionCampaignByPackage(promotion);

  const packageCode =
    promotion.package?.code ||
    DEFAULT_PACKAGE_CODE;

  const normalizedPackageCode = packageCode.trim().toUpperCase();

  const campaignCode =
    campaignByPackageCode[normalizedPackageCode] ||
    promotion.campaign?.code?.trim().toUpperCase() ||
    promotion.code?.trim().toUpperCase() ||
    "";

  const text = `${promotion.code ?? ""} ${promotion.campaign?.code ?? ""} ${
    promotion.title ?? ""
  }`.toUpperCase();

  const isMotherPromo =
    text.includes("AMOR-MAS-NATURAL") ||
    text.includes("3X2") ||
    text.includes("MAM");

  return {
    packageCode: normalizedPackageCode,
    campaignCode,
    campaignByPackageCode,
    adults: isMotherPromo ? 3 : 1,
    children: 0,
    infants: 0,
    notice: buildPromotionNotice(promotion, locale),
  };
}

export default function PromotionsPageView({
  locale,
  packages,
  featuredPromotion,
  promotions,
}: PromotionsPageViewProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const emptyPromotionState = useMemo<BookingPromotionState>(
    () => ({
      packageCode: "",
      campaignCode: "",
      campaignByPackageCode: {},
      adults: 1,
      children: 0,
      infants: 0,
      notice: "",
    }),
    []
  );

  const [bookingPromotion, setBookingPromotion] =
    useState<BookingPromotionState>(emptyPromotionState);

  function handleReserve(promotion: PromotionItem) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("kiichpam_xunaan_booking_draft_v3");
    }

    const nextBookingPromotion = buildPromotionBookingState(promotion, locale);

    setBookingPromotion(nextBookingPromotion);
    setIsBookingOpen(true);
  }

  function handleCloseBooking() {
    setIsBookingOpen(false);
    setBookingPromotion(emptyPromotionState);
  }

  return (
    <main className="min-h-screen bg-[#005F73] scroll-smooth">
      <PromotionsHero locale={locale} />

      <PromotionsSection
        locale={locale}
        featuredPromotion={featuredPromotion}
        promotions={promotions}
        onReserve={handleReserve}
      />

      <BookingModal
        isOpen={isBookingOpen}
        locale={locale}
        packages={packages}
        initialPackageCode={bookingPromotion.packageCode}
        initialCampaignCode={bookingPromotion.campaignCode}
        initialCampaignByPackageCode={bookingPromotion.campaignByPackageCode}
        initialAdults={bookingPromotion.adults}
        initialChildren={bookingPromotion.children}
        initialInfants={bookingPromotion.infants}
        promotionNotice={bookingPromotion.notice}
        onClose={handleCloseBooking}
      />
    </main>
  );
}
"use client";

import { useMemo, useState } from "react";
import type { PackageItem } from "@/features/home/types/home.types";
import BookingModal from "@/features/booking/components/BookingModal";
import type { PromotionItem } from "../types/promotions.types";
import PromotionsHero from "./PromotionsHero";
import PromotionsSection from "./PromotionsSection";
import PromotionReservationInfoModal from "./PromotionReservationInfoModal";

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
  },
  "PROMO-NACIONALES": {
    KX_BASIC: "NACIONALES-KX-BASIC-104",
    KX_PLUS: "NACIONALES-KX-PLUS-293",
    KX_TOTAL: "NACIONALES-KX-TOTAL-452",
  },
};

function normalizeCode(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

function getPromotionKey(promotion: PromotionItem) {
  const code = normalizeCode(promotion.code);
  const campaignCode = normalizeCode(promotion.campaign?.code);

  if (promotionCampaignMap[code]) return code;
  if (campaignCode && promotionCampaignMap[campaignCode]) return campaignCode;

  return code;
}

function getPromotionCampaignByPackage(promotion: PromotionItem) {
  const promotionKey = getPromotionKey(promotion);

  if (promotionCampaignMap[promotionKey]) {
    return promotionCampaignMap[promotionKey];
  }

  const directCampaignCode = normalizeCode(promotion.campaign?.code);

  if (directCampaignCode) {
    return {
      KX_BASIC: directCampaignCode,
      KX_PLUS: directCampaignCode,
      KX_TOTAL: directCampaignCode,
    };
  }

  const promotionCode = normalizeCode(promotion.code);

  if (promotionCode) {
    return {
      KX_BASIC: promotionCode,
      KX_PLUS: promotionCode,
      KX_TOTAL: promotionCode,
    };
  }

  return {};
}

function getPromotionFlags(promotion: PromotionItem) {
  const text = `${promotion.code ?? ""} ${promotion.campaign?.code ?? ""} ${
    promotion.title ?? ""
  }`.toUpperCase();

  return {
    isMotherPromo:
      text.includes("AMOR-MAS-NATURAL") ||
      text.includes("3X2") ||
      text.includes("MAM"),
    isPeninsularPromo: text.includes("PENINSULARES"),
    isNationalPromo: text.includes("NACIONALES"),
  };
}

function buildPromotionNotice(
  promotion: PromotionItem,
  locale: "es" | "en"
) {
  const { isMotherPromo, isPeninsularPromo, isNationalPromo } =
    getPromotionFlags(promotion);

  if (isMotherPromo) {
    return locale === "es"
      ? "Promoción 3x2 aplicada. Se precargaron 3 adultos. Para hacer válida esta promoción, una de las personas debe ser mamá."
      : "3x2 promotion applied. 3 adults were preloaded. To validate this promotion, one visitor must be a mom.";
  }

  if (isPeninsularPromo) {
    return locale === "es"
      ? "Promoción peninsular aplicada. Solo aplica para Aventura KX Básico. No se combina con INAPAM. Recuerda presentar identificación oficial vigente de Yucatán, Quintana Roo o Chetumal."
      : "Local resident promotion applied. It only applies to KX Basic Adventure. It cannot be combined with INAPAM. Please show a valid official ID from Yucatan, Quintana Roo or Chetumal.";
  }

  if (isNationalPromo) {
    return locale === "es"
      ? "Promoción nacional aplicada. Recuerda presentar identificación oficial vigente de México. Puede combinarse con INAPAM cuando la campaña esté configurada como acumulable."
      : "National promotion applied. Please show a valid official Mexican ID. It can be combined with INAPAM when the campaign is configured as stackable.";
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
  const { isMotherPromo, isPeninsularPromo } = getPromotionFlags(promotion);

  const packageCode = isPeninsularPromo
    ? "KX_BASIC"
    : promotion.package?.code || DEFAULT_PACKAGE_CODE;

  const normalizedPackageCode = normalizeCode(packageCode);

  const campaignCode =
    campaignByPackageCode[normalizedPackageCode] ||
    normalizeCode(promotion.campaign?.code) ||
    normalizeCode(promotion.code) ||
    "";

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
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] =
    useState<PromotionItem | null>(null);

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
    setSelectedPromotion(promotion);
    setIsInfoModalOpen(true);
  }

  function handleCloseInfoModal() {
    setIsInfoModalOpen(false);
    setSelectedPromotion(null);
  }

  function handleContinueFromInfoModal() {
    if (!selectedPromotion) return;

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("kiichpam_xunaan_booking_draft_v3");
    }

    const nextBookingPromotion = buildPromotionBookingState(
      selectedPromotion,
      locale
    );

    setBookingPromotion(nextBookingPromotion);
    setIsInfoModalOpen(false);
    setSelectedPromotion(null);
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

      <PromotionReservationInfoModal
        isOpen={isInfoModalOpen}
        locale={locale}
        promotion={selectedPromotion}
        onClose={handleCloseInfoModal}
        onContinue={handleContinueFromInfoModal}
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
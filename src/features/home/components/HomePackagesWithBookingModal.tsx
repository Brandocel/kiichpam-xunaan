"use client";

import { useState } from "react";
import type { PackageItem } from "../types/home.types";
import HomePackages from "./HomePackages";
import BookingModal from "@/features/booking/components/BookingModal";

interface HomePackagesWithBookingModalProps {
  locale: "es" | "en";
  packages: PackageItem[];
}

export default function HomePackagesWithBookingModal({
  locale,
  packages,
}: HomePackagesWithBookingModalProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPackageCode, setSelectedPackageCode] = useState("");

  function handleOpenBooking(packageCode: string) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("kiichpam_xunaan_booking_draft_v3");
    }

    setSelectedPackageCode(packageCode);
    setIsBookingOpen(true);
  }

  function handleCloseBooking() {
    setIsBookingOpen(false);
    setSelectedPackageCode("");
  }

  return (
    <>
      <HomePackages
        locale={locale}
        packages={packages}
        onReserve={handleOpenBooking}
      />

      <BookingModal
        isOpen={isBookingOpen}
        locale={locale}
        packages={packages}
        initialPackageCode={selectedPackageCode}
        initialCampaignCode=""
        initialCampaignByPackageCode={{}}
        initialAdults={1}
        initialChildren={0}
        initialInfants={0}
        promotionNotice=""
        onClose={handleCloseBooking}
      />
    </>
  );
}
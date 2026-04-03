"use client";

import type {
  ProposalGalleryItem,
  ProposalHeroSlide,
  ProposalPackageItem,
} from "../types/proposal.types";
import ProposalGallery from "./ProposalGallery";
import ProposalHero from "./ProposalHero";
import ProposalIntro from "./ProposalIntro";
import ProposalPackages from "./ProposalPackages";

interface ProposalPageViewProps {
  heroSlides: ProposalHeroSlide[];
  packageItems: ProposalPackageItem[];
  galleryItems: ProposalGalleryItem[];
  locale: "es" | "en";
}

export default function ProposalPageView({
  heroSlides,
  packageItems,
  galleryItems,
  locale,
}: ProposalPageViewProps) {
  return (
    <main className="bg-[#005F73]">
      <ProposalHero slides={heroSlides} locale={locale} />
      <ProposalIntro locale={locale} />
      <ProposalPackages items={packageItems} locale={locale} />
      <ProposalGallery items={galleryItems} locale={locale} />
    </main>
  );
}
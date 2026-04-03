"use client";

import type { ProposalHeroSlide } from "../types/proposal.types";
import ProposalGallery from "./ProposalGallery";
import ProposalHero from "./ProposalHero";
import ProposalIntro from "./ProposalIntro";
import ProposalPackages from "./ProposalPackages";

interface ProposalPageViewProps {
  locale: "es" | "en";
}

export default function ProposalPageView({
  locale,
}: ProposalPageViewProps) {
  const heroSlides: ProposalHeroSlide[] = [];

  return (
    <main className="bg-[#005F73]">
      <ProposalHero slides={heroSlides} locale={locale} />
      <ProposalIntro locale={locale} />
      <ProposalPackages locale={locale} />
      <ProposalGallery locale={locale} />
    </main>
  );
}
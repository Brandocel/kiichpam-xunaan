"use client";

import type { ProposalHeroSlide } from "../types/proposal.types";
import ProposalGallery from "./ProposalGallery";
import ProposalHero from "./ProposalHero";
import ProposalIntro from "./ProposalIntro";
import ProposalPackages from "./ProposalPackages";

interface ProposalPageViewProps {
  locale: "es" | "en";
}

export default function ProposalPageView({ locale }: ProposalPageViewProps) {
  const heroSlides: ProposalHeroSlide[] = [];

  return (
    <main className="bg-[#005F73] scroll-smooth">
      <ProposalHero slides={heroSlides} locale={locale} />
      <ProposalIntro locale={locale} />
      <ProposalPackages locale={locale} />

      <div id="proposal-gallery" className="scroll-mt-[120px]">
        <ProposalGallery locale={locale} />
      </div>
    </main>
  );
}
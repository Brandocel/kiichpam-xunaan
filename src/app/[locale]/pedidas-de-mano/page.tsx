import ProposalPageView from "../../../features/pedidas-de-mano/components/ProposalPageView";
import {
  getProposalGallery,
  getProposalHeroSlides,
  getProposalPackages,
} from "../../../features/pedidas-de-mano/services/proposal.service";

interface ProposalPageProps {
  params: Promise<{
    locale: "es" | "en";
  }>;
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { locale } = await params;

  const [heroSlides, packageItems, galleryItems] = await Promise.all([
    getProposalHeroSlides(),
    getProposalPackages(locale),
    getProposalGallery(locale),
  ]);

  return (
    <ProposalPageView
      heroSlides={heroSlides}
      packageItems={packageItems}
      galleryItems={galleryItems}
      locale={locale}
    />
  );
}
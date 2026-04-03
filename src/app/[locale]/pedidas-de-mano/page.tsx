import ProposalPageView from "../../../features/pedidas-de-mano/components/ProposalPageView";

interface ProposalPageProps {
  params: Promise<{
    locale: "es" | "en";
  }>;
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { locale } = await params;

  return <ProposalPageView locale={locale} />;
}
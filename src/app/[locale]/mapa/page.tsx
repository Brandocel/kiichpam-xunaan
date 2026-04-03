import { MapPageView } from "@/features/mapa";

type PageProps = {
  params: Promise<{
    locale: "es" | "en";
  }>;
};

export default async function MapaPage({ params }: PageProps) {
  const { locale } = await params;

  return <MapPageView locale={locale} />;
}
import mapaEs from "@/content/mapa/es";
import mapaEn from "@/content/mapa/en";
import Header from "@/shared/components/layout/Header";
import HowToArriveSection from "./HowToArriveSection";
import ParkMapViewer from "./ParkMapViewer";

type MapPageViewProps = {
  locale?: "es" | "en";
};

export default function MapPageView({ locale = "es" }: MapPageViewProps) {
  const t = locale === "en" ? mapaEn : mapaEs;
  const arrival = t.arrival;

  return (
    <main className="w-full overflow-x-hidden bg-[#005F74]">
      <Header locale={locale} variant="solid" />

      <ParkMapViewer />

      <HowToArriveSection
        titleLight={arrival.titleLight}
        titleBold={arrival.titleBold}
        addressLines={arrival.addressLines}
        phone={arrival.phone}
        buttonLabel={arrival.button}
        followUsLabel={arrival.followUs}
        googleMapsUrl="https://maps.google.com/?q=Kiichpam+Xunaan"
        mapEmbedUrl="https://www.google.com/maps?q=Kiichpam+Xunaan&z=11&output=embed"
      />
    </main>
  );
}
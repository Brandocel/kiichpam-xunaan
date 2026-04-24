import CenotesHero from "./CenotesHero";
import CenoteYunChen from "./CenoteYunChen";
import CenoteXkokay from "./CenoteXkokay";
import CenotesGallery from "./CenotesGallery";
import type { CenotesPageContent } from "../types/cenotes.types";

interface CenotesPageViewProps {
  content: CenotesPageContent;
  locale: "es" | "en";
}

export default function CenotesPageView({
  content,
  locale,
}: CenotesPageViewProps) {
  return (
    <main>
      <CenotesHero hero={content.hero} locale={locale} />
      <CenoteYunChen />
      <CenoteXkokay />
      <CenotesGallery />
    </main>
  );
}
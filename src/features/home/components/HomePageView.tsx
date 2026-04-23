import HomeHero from "./HomeHero";
import HomeAbout from "./HomeAbout";
import HomeExperiences from "./HomeExperiences";
import HomeNature from "./HomeNature";
import HomePackagesWithBookingModal from "./HomePackagesWithBookingModal";
import type {
  HeroSlide,
  PackageItem,
} from "../types/home.types";

interface HomePageViewProps {
  locale: "es" | "en";
  heroSlides: HeroSlide[];
  packageItems: PackageItem[];
}

export default function HomePageView({
  locale,
  heroSlides,
  packageItems,
}: HomePageViewProps) {
  return (
    <>
      <HomeHero locale={locale} slides={heroSlides} />
      <HomePackagesWithBookingModal
        locale={locale}
        packages={packageItems}
      />
      <HomeAbout locale={locale} />
      <HomeExperiences locale={locale} />
      <HomeNature locale={locale} />
    </>
  );
}
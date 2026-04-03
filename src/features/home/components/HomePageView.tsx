import type { HeroSlide, PackageItem } from "../types/home.types";
import HomeAbout from "./HomeAbout";
import HomeExperiences from "./HomeExperiences";
import HomeHero from "./HomeHero";
import HomeNature from "./HomeNature";
import HomePackages from "./HomePackages";

interface HomePageViewProps {
  heroSlides: HeroSlide[];
  packageItems: PackageItem[];
  locale?: "es" | "en";
}

export default function HomePageView({
  heroSlides,
  packageItems,
  locale = "es",
}: HomePageViewProps) {
  return (
    <main>
      <HomeHero slides={heroSlides} locale={locale} />
      <HomePackages packages={packageItems} locale={locale} />
      <HomeAbout locale={locale} />
      <HomeExperiences locale={locale} />
      <HomeNature locale={locale} />
    </main>
  );
}
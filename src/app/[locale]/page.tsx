import HomePageView from "../../features/home/components/HomePageView";
import {
  getHeroSlides,
  getPackages,
} from "../../features/home/services/home.service";

interface HomePageProps {
  params: Promise<{
    locale: "es" | "en";
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  const [slides, packageItems] = await Promise.all([
    getHeroSlides(),
    getPackages(locale),
  ]);

  return (
    <HomePageView
      heroSlides={slides}
      packageItems={packageItems}
      locale={locale}
    />
  );
}
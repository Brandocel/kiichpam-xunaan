import { BookingSection } from "@/features/booking";
import { getPackages } from "@/features/home/services/home.service";

interface ReservarPageProps {
  params: Promise<{
    locale: "es" | "en";
  }>;
  searchParams: Promise<{
    packageCode?: string;
  }>;
}

export default async function ReservarPage({
  params,
  searchParams,
}: ReservarPageProps) {
  const { locale } = await params;
  const { packageCode = "" } = await searchParams;

  const packages = await getPackages(locale);

  return (
    <BookingSection
      locale={locale}
      packages={packages}
      initialPackageCode={packageCode}
    />
  );
}
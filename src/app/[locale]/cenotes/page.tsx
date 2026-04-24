import { notFound } from "next/navigation";
import {
  CenotesPageView,
  getCenotesPageContent,
} from "../../../features/cenotes";

interface CenotesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

function isValidLocale(locale: string): locale is "es" | "en" {
  return locale === "es" || locale === "en";
}

export default async function CenotesPage({ params }: CenotesPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const content = getCenotesPageContent(locale);

  return <CenotesPageView content={content} />;
}
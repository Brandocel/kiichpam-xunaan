// src/app/[locale]/contacto/page.tsx

import Header from "@/shared/components/layout/Header";
import ContactHero from "@/features/contact/components/ContactHero";
import ContactForm from "@/features/contact/components/ContactForm";

type Locale = "es" | "en";

interface Props {
  params: Promise<{
    locale: Locale;
  }>;
}

function normalizeLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "es";
}

export default async function ContactoPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = normalizeLocale(resolvedParams.locale);

  return (
    <div className="min-h-screen bg-[#006f82]">
      <div className="relative">
        <Header locale={locale} />
        <ContactHero />
      </div>

      <ContactForm key={locale} locale={locale} />
    </div>
  );
}
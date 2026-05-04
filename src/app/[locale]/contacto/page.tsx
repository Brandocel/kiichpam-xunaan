import Header from "@/shared/components/layout/Header";
import ContactHero from "@/features/contact/components/ContactHero";
import ContactForm from "@/features/contact/components/ContactForm";

interface Props {
  params: {
    locale: "es" | "en";
  };
}

export default function ContactoPage({ params }: Props) {
  const locale = params.locale === "en" ? "en" : "es";

  return (
    <div className="min-h-screen bg-[#006f82]">
      <div className="relative">
        <Header locale={locale} />
        <ContactHero />
      </div>

      <ContactForm locale={locale} />
    </div>
  );
}
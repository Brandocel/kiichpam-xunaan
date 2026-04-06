import type { ReactNode } from "react";
import Footer from "@/shared/components/layout/Footer";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  const safeLocale: "es" | "en" = locale === "en" ? "en" : "es";

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      <Footer locale={safeLocale} />
    </div>
  );
}
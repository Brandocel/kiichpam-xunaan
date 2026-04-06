import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  locale?: "es" | "en";
}

const footerContent = {
  es: {
    about: "About",
    contact: "Contact",
    support: "Support",
    aboutLinks: [
      { label: "About us", href: "/#about" },
      { label: "Features", href: "/#features" },
      { label: "News & Blogs", href: "/blog" },
    ],
    contactLinks: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Twitter", href: "https://twitter.com" },
      { label: "Facebook", href: "https://facebook.com" },
    ],
    supportLinks: [
      { label: "FAQs", href: "/#faqs" },
      { label: "Support Centre", href: "/contacto" },
      { label: "Feedback", href: "/contacto" },
    ],
  },
  en: {
    about: "About",
    contact: "Contact",
    support: "Support",
    aboutLinks: [
      { label: "About us", href: "/#about" },
      { label: "Features", href: "/#features" },
      { label: "News & Blogs", href: "/blog" },
    ],
    contactLinks: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Twitter", href: "https://twitter.com" },
      { label: "Facebook", href: "https://facebook.com" },
    ],
    supportLinks: [
      { label: "FAQs", href: "/#faqs" },
      { label: "Support Centre", href: "/contacto" },
      { label: "Feedback", href: "/contacto" },
    ],
  },
} as const;

function withLocale(locale: "es" | "en", href: string) {
  if (href.startsWith("http")) return href;
  return `/${locale}${href}`;
}

function isExternal(href: string) {
  return href.startsWith("http");
}

export default function Footer({ locale = "es" }: FooterProps) {
  const t = footerContent[locale];

  return (
    <footer className="mt-auto bg-[#483289]">
      <div className="mx-auto max-w-[1512px] px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 lg:px-14 lg:py-16 xl:px-20 xl:py-[56px]">
        <div className="flex flex-col gap-10 md:gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16 xl:gap-24">
          <div className="flex shrink-0 justify-center lg:block">
            <Link href={`/${locale}`} aria-label="Kiichpam Xunáan home">
              <Image
                src="/footer/logofooter.svg"
                alt="Kiichpam Xunáan"
                width={239}
                height={252}
                className="h-[110px] w-auto sm:h-[130px] md:h-[145px] lg:h-[150px] xl:h-[160px]"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3 sm:text-left sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16">
            <FooterColumn title={t.about} links={t.aboutLinks} locale={locale} />
            <FooterColumn title={t.contact} links={t.contactLinks} locale={locale} />
            <FooterColumn title={t.support} links={t.supportLinks} locale={locale} />
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
  locale: "es" | "en";
}

function FooterColumn({ title, links, locale }: FooterColumnProps) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 font-[var(--font-poppins)] text-[20px] font-semibold leading-[1.06] tracking-[-0.01em] text-white sm:mb-4 md:text-[22px] lg:text-[24px] xl:text-[25px]">
        {title}
      </h3>

      <ul className="space-y-2 sm:space-y-3 md:space-y-4">
        {links.map((item) => {
          const href = withLocale(locale, item.href);
          const external = isExternal(item.href);

          return (
            <li key={`${title}-${item.label}`}>
              <Link
                href={href}
                {...(external
                  ? {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {})}
                className="font-[var(--font-poppins)] text-[18px] font-normal leading-[1.06] tracking-[-0.01em] text-white transition-opacity hover:opacity-80 md:text-[20px] lg:text-[22px] xl:text-[25px]"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
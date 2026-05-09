import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  locale?: "es" | "en";
}

const footerContent = {
  es: {
    home: "Inicio",
    contact: "Contacto",
    support: "Soporte",
    copyright: "© 2026 Ecoparque Ki’ichpam Xunaán. All rights reserved.",
    homeLinks: [
      { label: "Cenotes", href: "/cenotes" },
      { label: "Pedidas de mano", href: "/pedidas-de-mano" },
      { label: "Promociones", href: "/promociones" },
      { label: "Contacto", href: "/contacto" },
      { label: "Blog", href: "/blog" },
    ],
    contactLinks: [
      {
        label: "Instagram",
        href: "https://www.instagram.com/kiichpamxunaan/",
      },
      {
        label: "Facebook",
        href: "https://www.facebook.com/kiichpamxunaan",
      },
      {
        label: "Whatsapp",
        href: "https://wa.me/52XXXXXXXXXX",
      },
      {
        label: "Tiktok",
        href: "#",
      },
      {
        label: "Youtube",
        href: "#",
      },
    ],
    supportLinks: [
      { label: "FAQs", href: "/#faqs" },
      { label: "Atención al cliente", href: "/contacto" },
      { label: "Feedback", href: "/contacto" },
    ],
  },

  en: {
    home: "Home",
    contact: "Contact",
    support: "Support",
    copyright: "© 2026 Ecoparque Ki’ichpam Xunaán. All rights reserved.",
    homeLinks: [
      { label: "Cenotes", href: "/cenotes" },
      { label: "Proposal packages", href: "/pedidas-de-mano" },
      { label: "Promotions", href: "/promociones" },
      { label: "Contact", href: "/contacto" },
      { label: "Blog", href: "/blog" },
    ],
    contactLinks: [
      {
        label: "Instagram",
        href: "https://www.instagram.com/kiichpamxunaan/",
      },
      {
        label: "Facebook",
        href: "https://www.facebook.com/kiichpamxunaan",
      },
      {
        label: "Whatsapp",
        href: "https://wa.me/52XXXXXXXXXX",
      },
      {
        label: "Tiktok",
        href: "#",
      },
      {
        label: "Youtube",
        href: "#",
      },
    ],
    supportLinks: [
      { label: "FAQs", href: "/#faqs" },
      { label: "Customer support", href: "/contacto" },
      { label: "Feedback", href: "/contacto" },
    ],
  },
} as const;

function isExternal(href: string) {
  return href.startsWith("http");
}

function withLocale(locale: "es" | "en", href: string) {
  if (href.startsWith("http")) return href;
  if (href === "#") return href;
  if (href.startsWith("/#")) return `/${locale}${href}`;
  return `/${locale}${href}`;
}

export default function Footer({ locale = "es" }: FooterProps) {
  const t = footerContent[locale];

  return (
    <footer className="mt-auto w-full overflow-hidden bg-[#493287] text-white">
      {/* Franja superior del patrón */}
      <div
        className="
          h-[36px] 
          w-full 
          bg-[url('/footer/text.png')] 
          bg-repeat-x 
          bg-top
          [background-size:auto_36px]
        "
        aria-hidden="true"
      />

      {/* Contenido principal */}
      <div
        className="
          mx-auto 
          flex 
          min-h-[248px] 
          w-full 
          max-w-[1080px] 
          flex-col 
          px-8 
          pb-4 
          pt-11
          sm:px-10
          lg:px-16
        "
      >
        <div
          className="
            flex 
            flex-1 
            flex-col 
            items-center 
            justify-center 
            gap-10 
            md:flex-row 
            md:items-start 
            md:justify-between 
            md:gap-14
          "
        >
          {/* Logo */}
          <div className="flex shrink-0 justify-center md:justify-start">
            <Link href={`/${locale}`} aria-label="Kiichpam Xunáan home">
              <Image
                src="/footer/logofooter.svg"
                alt="Kiichpam Xunáan"
                width={180}
                height={180}
                priority={false}
                className="
                  h-[130px] 
                  w-auto 
                  object-contain
                  sm:h-[145px]
                  md:h-[150px]
                  lg:h-[158px]
                "
              />
            </Link>
          </div>

          {/* Columnas */}
          <div
            className="
              grid 
              w-full 
              max-w-[505px] 
              grid-cols-1 
              gap-9 
              text-center 
              sm:grid-cols-3 
              sm:gap-8 
              sm:text-left
              md:mt-4
            "
          >
            <FooterColumn title={t.home} links={t.homeLinks} locale={locale} />
            <FooterColumn
              title={t.contact}
              links={t.contactLinks}
              locale={locale}
            />
            <FooterColumn
              title={t.support}
              links={t.supportLinks}
              locale={locale}
            />
          </div>
        </div>

        {/* Copyright */}
        <p
          className="
            mt-7 
            text-center 
            font-[var(--font-poppins)] 
            text-[11px] 
            font-semibold 
            leading-none 
            text-white
            sm:text-[12px]
          "
        >
          {t.copyright}
        </p>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  links: ReadonlyArray<{
    label: string;
    href: string;
  }>;
  locale: "es" | "en";
}

function FooterColumn({ title, links, locale }: FooterColumnProps) {
  return (
    <div className="min-w-0">
      <h3
        className="
          mb-3 
          font-[var(--font-poppins)] 
          text-[15px] 
          font-bold 
          leading-[1.1] 
          text-white
        "
      >
        {title}
      </h3>

      <ul className="space-y-[10px]">
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
                className="
                  font-[var(--font-poppins)] 
                  text-[15px] 
                  font-normal 
                  leading-[1.1] 
                  text-white 
                  transition-opacity 
                  hover:opacity-80
                "
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
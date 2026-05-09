import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  locale?: "es" | "en";
}

type FooterLink = {
  label: string;
  href: string;
};

const footerContent = {
  es: {
    home: "Navegación",
    contact: "Contacto",
    support: "Soporte",
    copyright: "© 2026 Ecoparque Ki’ichpam Xunaán. Todos los derechos reservados.",
    homeLinks: [
      { label: "Cenotes", href: "/cenotes" },
      { label: "Pedidas de mano", href: "/pedidas-de-mano" },
      { label: "Promociones", href: "/promociones" },
      { label: "Contacto", href: "/contacto" },
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
        label: "WhatsApp",
        href: "https://wa.me/52XXXXXXXXXX",
      },
      {
        label: "TikTok",
        href: "#",
      },
      {
        label: "YouTube",
        href: "#",
      },
    ],
    supportLinks: [
      { label: "FAQs", href: "/#faqs" },
      { label: "Atención al cliente", href: "/contacto" },
      { label: "Comentarios", href: "/contacto" },
    ],
  },

  en: {
    home: "Navigation",
    contact: "Contact",
    support: "Support",
    copyright: "© 2026 Ecoparque Ki’ichpam Xunaán. All rights reserved.",
    homeLinks: [
      { label: "Cenotes", href: "/cenotes" },
      { label: "Proposals", href: "/pedidas-de-mano" },
      { label: "Promotions", href: "/promociones" },
      { label: "Contact", href: "/contacto" },
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
        label: "WhatsApp",
        href: "https://wa.me/52XXXXXXXXXX",
      },
      {
        label: "TikTok",
        href: "#",
      },
      {
        label: "YouTube",
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

function isExternalLink(href: string) {
  return href.startsWith("http");
}

function buildLocalizedHref(locale: "es" | "en", href: string) {
  if (href.startsWith("http")) return href;
  if (href === "#") return href;

  if (href.startsWith("/#")) {
    return `/${locale}${href}`;
  }

  return `/${locale}${href}`;
}

export default function Footer({ locale = "es" }: FooterProps) {
  const t = footerContent[locale];

  return (
    <footer className="mt-auto w-full overflow-hidden bg-[linear-gradient(180deg,#8B197C_0%,#26051F_100%)] text-white">
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

      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1800px]
          flex-col
          px-6
          pb-5
          pt-10
          sm:px-8
          sm:pt-12
          md:px-12
          xl:px-20
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            justify-between
            gap-10
            lg:flex-row
            lg:items-start
            lg:gap-16
          "
        >
          <div className="flex shrink-0 justify-center lg:justify-start">
            <Link
              href={`/${locale}`}
              aria-label="Kiichpam Xunaan home"
              className="block transition-opacity duration-300 hover:opacity-85"
            >
              <div
                className="
                  relative
                  h-[120px]
                  w-[120px]
                  sm:h-[135px]
                  sm:w-[135px]
                  md:h-[150px]
                  md:w-[150px]
                  xl:h-[165px]
                  xl:w-[165px]
                "
              >
                <Image
                  src="/footer/logofooter.svg"
                  alt="Kiichpam Xunaan"
                  fill
                  priority={false}
                  className="object-contain"
                  sizes="(max-width: 640px) 120px, (max-width: 768px) 135px, (max-width: 1280px) 150px, 165px"
                />
              </div>
            </Link>
          </div>

          <div
            className="
              grid
              w-full
              max-w-[760px]
              grid-cols-1
              gap-9
              text-center
              sm:grid-cols-3
              sm:gap-8
              sm:text-left
              lg:pt-5
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

        <div className="mt-10 border-t border-white/15 pt-5">
          <p
            className="
              text-center
              font-[var(--font-poppins)]
              text-[12px]
              font-medium
              leading-relaxed
              text-white/85
              sm:text-[13px]
            "
          >
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  links: ReadonlyArray<FooterLink>;
  locale: "es" | "en";
}

function FooterColumn({ title, links, locale }: FooterColumnProps) {
  return (
    <div className="min-w-0">
      <h3
        className="
          mb-4
          font-[var(--font-poppins)]
          text-[18px]
          font-semibold
          leading-none
          text-white
          xl:text-[20px]
        "
      >
        {title}
      </h3>

      <ul className="space-y-3">
        {links.map((item) => {
          const href = buildLocalizedHref(locale, item.href);
          const external = isExternalLink(item.href);

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
                  inline-block
                  font-[var(--font-poppins)]
                  text-[15px]
                  font-normal
                  leading-snug
                  text-white/85
                  transition-all
                  duration-300
                  hover:translate-x-1
                  hover:text-white
                  hover:opacity-90
                  xl:text-[16px]
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
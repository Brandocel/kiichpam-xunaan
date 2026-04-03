"use client";

import Image from "next/image";
import Link from "next/link";

type SocialItem = {
  alt: string;
  href: string;
  src: string;
};

type HowToArriveSectionProps = {
  titleLight?: string;
  titleBold?: string;
  addressLines?: string[];
  phone?: string;
  buttonLabel?: string;
  googleMapsUrl?: string;
  mapEmbedUrl?: string;
  followUsLabel?: string;
  socials?: SocialItem[];
};

const DEFAULT_SOCIALS: SocialItem[] = [
  { alt: "Facebook", href: "https://facebook.com", src: "/mapa/social/facebook.svg" },
  { alt: "X", href: "https://x.com", src: "/mapa/social/x.svg" },
  { alt: "Instagram", href: "https://instagram.com", src: "/mapa/social/instagram.svg" },
  { alt: "WhatsApp", href: "https://wa.me/5219987510867", src: "/mapa/social/whatsapp.svg" },
  { alt: "TikTok", href: "https://tiktok.com", src: "/mapa/social/tiktok.svg" },
  { alt: "Messenger", href: "https://m.me/", src: "/mapa/social/messenger.svg" },
  { alt: "YouTube", href: "https://youtube.com", src: "/mapa/social/youtube.svg" },
];

export default function HowToArriveSection({
  titleLight = "¿Cómo llegar a",
  titleBold = "Ki’ichpam Xunaán?",
  addressLines = [
    "Carretera Yalcoba-Xtut,",
    "Supermanzana km 9.5, 97794",
    "Yalcobá, Yucatán",
  ],
  phone = "+52 1 998 751 0867",
  buttonLabel = "Abrir en Google Maps",
  googleMapsUrl = "https://maps.google.com/?q=Kiichpam+Xunaan",
  mapEmbedUrl = "https://www.google.com/maps?q=Kiichpam+Xunaan&z=11&output=embed",
  followUsLabel = "Síguenos en:",
  socials = DEFAULT_SOCIALS,
}: HowToArriveSectionProps) {
  return (
    <section className="relative z-10 w-full bg-[#005F74] md:-mt-[80px] lg:-mt-[110px]">
      <div className="w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:h-[370px]">
          <div
            className="relative w-full bg-[#005F74] lg:h-[370px] lg:w-[370px] lg:min-w-[370px]"
            style={{
              backgroundImage: "url('/mapa/textura.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "320px auto",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-10 flex h-full flex-col justify-start px-6 pb-8 pt-12 sm:px-8 lg:px-[34px] lg:pt-[62px]">
              <div className="max-w-[300px]">
                <h2 className="leading-none text-white">
                  <span className="block text-[30px] font-light tracking-[-0.02em] lg:text-[34px]">
                    {titleLight}
                  </span>
                  <span className="mt-1 block text-[27px] font-extrabold tracking-[-0.02em] lg:text-[28px]">
                    {titleBold}
                  </span>
                </h2>

                <div className="mt-6">
                  {addressLines.map((line, index) => (
                    <p
                      key={`${line}-${index}`}
                      className="text-[16px] font-medium leading-[1.18] text-white lg:text-[17px]"
                    >
                      {line}
                    </p>
                  ))}

                  <p className="mt-2 text-[17px] font-extrabold leading-[1.18] text-white lg:text-[18px]">
                    {phone}
                  </p>
                </div>

                <Link
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex h-[38px] min-w-[185px] items-center justify-center rounded-[6px] bg-[#C028B9] px-5 text-center text-[14px] font-extrabold text-white transition hover:opacity-90"
                >
                  {buttonLabel}
                </Link>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full bg-[#d9d9d9] lg:h-[370px] lg:flex-1">
            <iframe
              src={mapEmbedUrl}
              title="Mapa de ubicación de Ki’ichpam Xunaán"
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        <div className="flex min-h-[138px] w-full flex-col items-center justify-center bg-[#005F74] px-4 py-6">
          <h3 className="text-center text-[28px] font-extrabold leading-none text-white lg:text-[30px]">
            {followUsLabel}
          </h3>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 lg:gap-6">
            {socials.map((social) => (
              <Link
                key={social.alt}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.alt}
                className="inline-flex h-[38px] w-[38px] items-center justify-center transition hover:scale-105 hover:opacity-90"
              >
                <Image
                  src={social.src}
                  alt={social.alt}
                  width={38}
                  height={38}
                  className="h-[38px] w-[38px] object-contain"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
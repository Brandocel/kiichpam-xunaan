"use client";

import Image from "next/image";
import {
  BadgeCheck,
  CalendarCheck2,
  Gift,
  Info,
  ShieldCheck,
  TicketPercent,
  TriangleAlert,
  X,
} from "lucide-react";
import type { PromotionItem } from "../types/promotions.types";

interface PromotionReservationInfoModalProps {
  isOpen: boolean;
  locale: "es" | "en";
  promotion: PromotionItem | null;
  onClose: () => void;
  onContinue: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const fallbackImage = "/promociones/default.webp";

function resolveImageUrl(url?: string | null) {
  if (!url) return fallbackImage;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (!API_BASE_URL) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function normalizeCode(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

function getPromotionKind(promotion: PromotionItem | null) {
  const code = normalizeCode(promotion?.code);
  const campaignCode = normalizeCode(promotion?.campaign?.code);
  const title = normalizeCode(promotion?.title);

  const text = `${code} ${campaignCode} ${title}`;

  if (
    text.includes("AMOR-MAS-NATURAL") ||
    text.includes("3X2") ||
    text.includes("MAM")
  ) {
    return "MOTHER_3X2";
  }

  if (text.includes("PENINSULARES")) {
    return "PENINSULAR";
  }

  if (text.includes("NACIONALES")) {
    return "NATIONAL";
  }

  return "GENERAL";
}

function getTexts(locale: "es" | "en") {
  return locale === "es"
    ? {
        title: "Antes de reservar",
        subtitle:
          "Revisa las condiciones de la promoción para que tu reservación se calcule correctamente.",
        continue: "Entiendo y quiero reservar",
        cancel: "Volver",
        validBooking: "Promoción lista para reservar",
        important: "Información importante",
        applies: "Aplicación de la promoción",
        requirements: "Requisitos",
        selectedPromotion: "Promoción seleccionada",
        defaultDescription:
          "Esta promoción se aplicará automáticamente durante la cotización cuando corresponda.",
      }
    : {
        title: "Before booking",
        subtitle:
          "Review the promotion conditions so your reservation is calculated correctly.",
        continue: "I understand and want to book",
        cancel: "Back",
        validBooking: "Promotion ready to book",
        important: "Important information",
        applies: "How the promotion applies",
        requirements: "Requirements",
        selectedPromotion: "Selected promotion",
        defaultDescription:
          "This promotion will be applied automatically during the quote when applicable.",
      };
}

function getPromotionDetails(
  promotion: PromotionItem | null,
  locale: "es" | "en"
) {
  const kind = getPromotionKind(promotion);

  if (kind === "MOTHER_3X2") {
    return locale === "es"
      ? {
          badge: "3x2",
          headline: "Promoción 3x2 aplicada",
          description:
            "Se precargarán 3 adultos para que la cotización tome la promoción correctamente.",
          items: [
            "La promoción aplica al comprar 2 entradas participantes.",
            "La tercera entrada aplica como cortesía según disponibilidad.",
            "Para hacer válida la promoción, una de las personas debe ser mamá.",
            "No acumulable con otras promociones."
          ],
          chips: ["3 adultos precargados", "No acumulable", "Sujeta a validación"],
          warning:
            "Recuerda presentar la información necesaria al llegar para validar la promoción."
        }
      : {
          badge: "3x2",
          headline: "3x2 promotion applied",
          description:
            "3 adults will be preloaded so the quote can calculate the promotion correctly.",
          items: [
            "The promotion applies when purchasing 2 participating tickets.",
            "The third ticket applies as complimentary, subject to availability.",
            "To validate the promotion, one visitor must be a mom.",
            "Cannot be combined with other promotions."
          ],
          chips: ["3 adults preloaded", "Not combinable", "Subject to validation"],
          warning:
            "Remember to provide the required information on arrival to validate the promotion."
        };
  }

  if (kind === "PENINSULAR") {
    return locale === "es"
      ? {
          badge: "Peninsulares",
          headline: "Promo Peninsulares",
          description:
            "Esta promoción aplica únicamente para Aventura KX Básico con precio especial de $99.00 MXN.",
          items: [
            "Aplica solo para Aventura KX Básico.",
            "Adulto, niño e INAPAM usan el mismo precio promocional de $99.00 MXN.",
            "No se combina con descuento INAPAM.",
            "Requiere identificación oficial vigente de Yucatán, Quintana Roo o Chetumal."
          ],
          chips: ["Solo KX Básico", "$99.00 MXN", "No combina INAPAM"],
          warning:
            "Si cambias a KX Plus o KX Total dentro de la reservación, la promoción peninsular no se aplicará."
        }
      : {
          badge: "Local residents",
          headline: "Local Residents Promo",
          description:
            "This promotion applies only to KX Basic Adventure with a special price of $99.00 MXN.",
          items: [
            "Applies only to KX Basic Adventure.",
            "Adult, child and INAPAM visitors use the same promotional price of $99.00 MXN.",
            "Cannot be combined with INAPAM discount.",
            "Requires a valid official ID from Yucatan, Quintana Roo or Chetumal."
          ],
          chips: ["KX Basic only", "$99.00 MXN", "No INAPAM combo"],
          warning:
            "If you switch to KX Plus or KX Total during booking, the local resident promotion will not apply."
        };
  }

  if (kind === "NATIONAL") {
    return locale === "es"
      ? {
          badge: "Nacionales",
          headline: "Promo Nacionales",
          description:
            "Esta promoción aplica precios especiales para personas con identificación oficial mexicana.",
          items: [
            "Aplica para Aventura KX Básico, KX Plus y KX Total.",
            "El precio cambia según el paquete seleccionado.",
            "Puede combinarse con INAPAM cuando la campaña esté configurada como acumulable.",
            "Requiere identificación oficial mexicana vigente."
          ],
          chips: ["México", "Puede combinar INAPAM", "Todos los paquetes"],
          warning:
            "El descuento INAPAM se valida por número de visitantes INAPAM y se calcula en la cotización."
        }
      : {
          badge: "Mexican nationals",
          headline: "Mexican Nationals Promo",
          description:
            "This promotion applies special prices for visitors with a valid Mexican official ID.",
          items: [
            "Applies to KX Basic, KX Plus and KX Total.",
            "The price changes depending on the selected package.",
            "Can be combined with INAPAM when the campaign is configured as stackable.",
            "Requires a valid Mexican official ID."
          ],
          chips: ["Mexico", "INAPAM compatible", "All packages"],
          warning:
            "The INAPAM discount is validated by the number of INAPAM visitors and calculated in the quote."
        };
  }

  return locale === "es"
    ? {
        badge: "Promoción",
        headline: promotion?.title || "Promoción disponible",
        description:
          promotion?.description ||
          "Esta promoción se aplicará durante el proceso de reservación.",
        items: [
          "La promoción será validada durante la cotización.",
          "Revisa el total antes de continuar con el pago.",
          "Puede estar sujeta a disponibilidad."
        ],
        chips: ["Promoción activa", "Sujeta a validación"],
        warning:
          "El total final se mostrará antes de completar la reservación."
      }
    : {
        badge: "Promotion",
        headline: promotion?.title || "Available promotion",
        description:
          promotion?.description ||
          "This promotion will be applied during the booking process.",
        items: [
          "The promotion will be validated during the quote.",
          "Review the total before continuing to payment.",
          "May be subject to availability."
        ],
        chips: ["Active promotion", "Subject to validation"],
        warning:
          "The final total will be shown before completing the reservation."
      };
}

export default function PromotionReservationInfoModal({
  isOpen,
  locale,
  promotion,
  onClose,
  onContinue,
}: PromotionReservationInfoModalProps) {
  if (!isOpen || !promotion) return null;

  const t = getTexts(locale);
  const details = getPromotionDetails(promotion, locale);
  const imageUrl = resolveImageUrl(promotion.imageMedia?.url);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(0,0,0,0.68)] px-4 py-5 backdrop-blur-[3px] md:px-6">
      <div className="relative w-full max-w-[1080px] overflow-hidden rounded-[28px] bg-[#F3F3F3] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <button
          type="button"
          onClick={onClose}
          aria-label={locale === "es" ? "Cerrar" : "Close"}
          className="absolute right-4 top-4 z-30 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90 text-[#005F74] shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition hover:scale-105 hover:text-[#C028B9]"
        >
          <X size={22} strokeWidth={2.4} />
        </button>

        <div className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[430px_1fr]">
          <div className="relative min-h-[320px] bg-[#005F74] lg:min-h-full">
            <Image
              src={imageUrl}
              alt={promotion.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 430px"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#005F74] via-[rgba(0,95,116,0.35)] to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#C028B9] px-4 py-2 text-[13px] font-black uppercase tracking-[0.08em]">
                <TicketPercent size={16} />
                {details.badge}
              </div>

              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/80">
                {t.selectedPromotion}
              </p>

              <h2 className="mt-2 font-[var(--font-be-vietnam-pro)] text-[28px] font-black leading-tight md:text-[34px]">
                {promotion.title}
              </h2>

              {promotion.subtitle ? (
                <p className="mt-2 text-[17px] font-bold text-white">
                  {promotion.subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div className="bg-[#F3F3F3] p-6 sm:p-8 md:p-10">
            <div className="max-w-[560px]">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F3F6] px-4 py-2 text-[13px] font-black text-[#005F74]">
                <BadgeCheck size={17} />
                {t.validBooking}
              </div>

              <h3 className="mt-5 font-[var(--font-be-vietnam-pro)] text-[32px] font-black leading-[1.05] text-[#005F74] md:text-[42px]">
                {t.title}
              </h3>

              <p className="mt-3 text-[16px] leading-[1.55] text-[#4B5563] md:text-[18px]">
                {t.subtitle}
              </p>

              <div className="mt-7 rounded-[22px] border border-[#D6D6D6] bg-white p-5 shadow-[0_14px_35px_rgba(0,0,0,0.08)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[#C028B9] text-white">
                    <Gift size={23} strokeWidth={2.3} />
                  </div>

                  <div>
                    <p className="font-[var(--font-be-vietnam-pro)] text-[21px] font-black leading-tight text-[#005F74]">
                      {details.headline}
                    </p>

                    <p className="mt-2 text-[15px] leading-[1.55] text-[#5F5F5F]">
                      {details.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {details.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-[#F6E8F7] px-3 py-1.5 text-[12px] font-black text-[#C028B9]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[18px] bg-[#E9E9E9] p-5">
                  <div className="mb-3 flex items-center gap-2 text-[#005F74]">
                    <CalendarCheck2 size={20} />
                    <p className="font-[var(--font-be-vietnam-pro)] text-[16px] font-black">
                      {t.applies}
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-[14px] leading-[1.45] text-[#4B5563]">
                    {details.items.slice(0, 2).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C028B9]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[18px] bg-[#E9E9E9] p-5">
                  <div className="mb-3 flex items-center gap-2 text-[#005F74]">
                    <ShieldCheck size={20} />
                    <p className="font-[var(--font-be-vietnam-pro)] text-[16px] font-black">
                      {t.requirements}
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-[14px] leading-[1.45] text-[#4B5563]">
                    {details.items.slice(2).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#005F74]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-[18px] border border-[#F1C6EF] bg-[#FFF7FE] p-4">
                <div className="flex items-start gap-3">
                  <TriangleAlert
                    size={20}
                    className="mt-0.5 shrink-0 text-[#C028B9]"
                  />
                  <div>
                    <p className="font-[var(--font-be-vietnam-pro)] text-[14px] font-black text-[#C028B9]">
                      {t.important}
                    </p>
                    <p className="mt-1 text-[14px] leading-[1.55] text-[#5F5F5F]">
                      {details.warning}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-[46px] items-center justify-center rounded-[9px] border border-[#C7C7C7] bg-white px-6 text-[15px] font-black text-[#005F74] transition hover:border-[#005F74] hover:bg-[#E8F3F6]"
                >
                  {t.cancel}
                </button>

                <button
                  type="button"
                  onClick={onContinue}
                  className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[9px] bg-[#C028B9] px-7 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(192,40,185,0.28)] transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
                >
                  <Info size={18} />
                  {t.continue}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
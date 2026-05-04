"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { sendContactMessage } from "../services/contact.service";
import type {
  ContactLocale,
  ContactSubjectType,
} from "../types/contact.types";

interface ContactFormProps {
  locale: ContactLocale;
}

type SocialItem = {
  alt: string;
  href: string;
  src: string;
};

const DEFAULT_SOCIALS: SocialItem[] = [
  {
    alt: "Facebook",
    href: "https://www.facebook.com/kiichpamxunaan",
    src: "/mapa/social/facebook.svg",
  },
  {
    alt: "Instagram",
    href: "https://www.instagram.com/kiichpamxunaan/",
    src: "/mapa/social/instagram.svg",
  },
  {
    alt: "WhatsApp",
    href: "https://wa.me/5219987510867",
    src: "/mapa/social/whatsapp.svg",
  },
  {
    alt: "TikTok",
    href: "https://www.tiktok.com/@kiichpamxunaan?lang=es",
    src: "/mapa/social/tiktok.svg",
  },
  {
    alt: "YouTube",
    href: "https://www.youtube.com/@kiichpamxunaan",
    src: "/mapa/social/youtube.svg",
  },
];

const translations = {
  es: {
    title: "Mantengamonos en contacto",
    description:
      "Agradecemos todos comentarios para poderte dar la mejor experiencia posible antes, durante y después de tu visita a nuestro ecoparque",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Email",
    phone: "Numero de teléfono",
    message: "Mensaje",
    submit: "Enviar",
    sending: "Enviando...",
    success: "Mensaje enviado correctamente.",
    error: "No se pudo enviar el mensaje.",
    follow: "Siguenos en:",
  },
  en: {
    title: "Stay in touch",
    description:
      "We appreciate all comments so we can give you the best possible experience before, during and after your visit to our eco park",
    firstName: "Name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone number",
    message: "Message",
    submit: "Send",
    sending: "Sending...",
    success: "Message sent successfully.",
    error: "The message could not be sent.",
    follow: "Follow us:",
  },
};

export default function ContactForm({ locale }: ContactFormProps) {
  const t = translations[locale];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSending(true);

    try {
      await sendContactMessage({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        country: undefined,
        subjectType: "general" as ContactSubjectType,
        subject:
          locale === "es"
            ? "Mensaje desde formulario de contacto"
            : "Message from contact form",
        message: formData.message.trim(),
        lang: locale,
      });

      setStatus({
        type: "success",
        message: t.success,
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : t.error,
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#073d5d_0%,#006f82_55%,#00798a_100%)]">
      <div className="mx-auto max-w-[1512px] px-6 pb-10 pt-14 sm:px-10 md:pt-20 lg:px-20">
        <div className="mx-auto grid max-w-[1160px] items-start gap-10 md:grid-cols-2 lg:gap-[90px]">
          <div className="w-full text-white">
            <h2 className="text-[30px] font-semibold leading-[100%] tracking-[-0.02em] sm:text-[34px]">
              {t.title}
            </h2>

            <p className="mt-4 max-w-[415px] text-[16px] font-normal leading-[100%] tracking-[-0.01em] text-white/80">
              {t.description}
            </p>

            {status && (
              <div
                className={`mt-6 rounded-[5px] px-4 py-3 text-sm font-medium ${
                  status.type === "success"
                    ? "bg-emerald-500/20 text-emerald-100"
                    : "bg-red-500/20 text-red-100"
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-10 w-full max-w-[426px]">
              <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
                <FloatingInput
                  name="firstName"
                  label={t.firstName}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />

                <FloatingInput
                  name="lastName"
                  label={t.lastName}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <FloatingInput
                name="email"
                type="email"
                label={t.email}
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-[10px]"
              />

              <FloatingInput
                name="phone"
                label={t.phone}
                value={formData.phone}
                onChange={handleChange}
                className="mt-[10px]"
              />

              <FloatingTextarea
                name="message"
                label={t.message}
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-[10px]"
              />

              <button
                type="submit"
                disabled={isSending}
                className="mt-[10px] h-[42px] w-full rounded-[5px] bg-[linear-gradient(90deg,#763AF5_0%,#A604F2_100%)] px-[10px] py-3 text-[16px] font-normal leading-none text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? t.sending : t.submit}
              </button>
            </form>
          </div>

          <div className="flex w-full justify-center md:justify-end">
            <img
              src="/contacto/pajaroto.png"
              alt="Contacto"
              className="h-auto w-full max-w-[560px] rounded-[10px] object-cover shadow-[0_22px_60px_rgba(0,0,0,0.18)] md:min-h-[430px] lg:min-h-[520px]"
            />
          </div>
        </div>
      </div>

      <div
        className="relative flex min-h-[300px] w-full flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-14 text-white md:min-h-[340px]"
        style={{
          backgroundImage: "url('/contacto/TexturaKXXN.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "1100px auto",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#006f82]/80" />

        <div className="absolute inset-x-0 top-0 h-[120px] bg-[linear-gradient(180deg,#006f82_0%,rgba(0,111,130,0)_100%)]" />

        <div className="relative z-10 flex flex-col items-center">
          <h3 className="text-center text-[32px] font-extrabold leading-none tracking-[-0.03em] md:text-[38px]">
            {t.follow}
          </h3>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-9 sm:gap-12 md:gap-[68px]">
            {DEFAULT_SOCIALS.map((social) => (
              <Link
                key={social.alt}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.alt}
                className="inline-flex h-[46px] w-[46px] items-center justify-center transition hover:-translate-y-1 hover:opacity-90"
              >
                <Image
                  src={social.src}
                  alt={social.alt}
                  width={46}
                  height={46}
                  className="h-[46px] w-[46px] object-contain"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface FloatingInputProps {
  name: string;
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  className?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function FloatingInput({
  name,
  label,
  value,
  type = "text",
  required = false,
  className = "",
  onChange,
}: FloatingInputProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer h-[42px] w-full rounded-[5px] border border-white/15 bg-white/5 px-[10px] pb-[7px] pt-[18px] text-[15px] font-normal leading-none text-white outline-none transition placeholder:text-transparent focus:border-white/45"
      />

      <label
        htmlFor={name}
        className="pointer-events-none absolute left-[10px] top-1/2 -translate-y-1/2 text-[15px] font-normal leading-none text-white/60 transition-all duration-200 peer-focus:top-[9px] peer-focus:text-[11px] peer-focus:text-white/80 peer-[:not(:placeholder-shown)]:top-[9px] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-white/80"
      >
        {label}
      </label>
    </div>
  );
}

interface FloatingTextareaProps {
  name: string;
  label: string;
  value: string;
  required?: boolean;
  className?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function FloatingTextarea({
  name,
  label,
  value,
  required = false,
  className = "",
  onChange,
}: FloatingTextareaProps) {
  return (
    <div className={`relative ${className}`}>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer h-[116px] w-full resize-none rounded-[5px] border border-white/15 bg-white/5 px-[10px] pb-3 pt-[24px] text-[15px] font-normal leading-[130%] text-white outline-none transition placeholder:text-transparent focus:border-white/45"
      />

      <label
        htmlFor={name}
        className="pointer-events-none absolute left-[10px] top-[20px] -translate-y-1/2 text-[15px] font-normal leading-none text-white/60 transition-all duration-200 peer-focus:top-[11px] peer-focus:text-[11px] peer-focus:text-white/80 peer-[:not(:placeholder-shown)]:top-[11px] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-white/80"
      >
        {label}
      </label>
    </div>
  );
}
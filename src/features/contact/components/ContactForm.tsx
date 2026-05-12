"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { sendContactMessage } from "../services/contact.service";
import type { ContactLocale } from "../types/contact.types";

interface ContactFormProps {
  locale: ContactLocale;
}

type Locale = "es" | "en";

type SocialItem = {
  alt: string;
  href: string;
  src: string;
};

type ContactFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
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
    title: "Mantengámonos en contacto",
    description:
      "Agradecemos todos tus comentarios para poder darte la mejor experiencia posible antes, durante y después de tu visita a nuestro ecoparque",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Email",
    phone: "Número de teléfono",
    message: "Mensaje",
    submit: "Enviar",
    sending: "Enviando...",
    success: "Mensaje enviado correctamente.",
    error: "No se pudo enviar el mensaje.",
    follow: "Síguenos en:",
    defaultSubject: "Quiero información sobre paquetes",
    defaultCountry: "México",
    missingName: "Ingresa tu nombre y apellido.",
    missingEmail: "Ingresa tu correo electrónico.",
    invalidEmail: "Ingresa un correo electrónico válido.",
    missingMessage: "Ingresa tu mensaje.",
    animation: "Ver animación",
    imageAlt: "Contacto Kiichpam Xunaan",
  },
  en: {
    title: "Let’s keep in touch",
    description:
      "We appreciate all your comments so we can give you the best possible experience before, during and after your visit to our eco park",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone number",
    message: "Message",
    submit: "Send",
    sending: "Sending...",
    success: "Message sent successfully.",
    error: "The message could not be sent.",
    follow: "Follow us:",
    defaultSubject: "I want more information about packages",
    defaultCountry: "Mexico",
    missingName: "Enter your first and last name.",
    missingEmail: "Enter your email address.",
    invalidEmail: "Enter a valid email address.",
    missingMessage: "Enter your message.",
    animation: "View animation",
    imageAlt: "Kiichpam Xunaan contact",
  },
} as const;

const initialFormData: ContactFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

function normalizeLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "es";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactForm({ locale }: ContactFormProps) {
  const safeLocale = normalizeLocale(locale);
  const t = translations[safeLocale];

  const [formData, setFormData] =
    useState<ContactFormState>(initialFormData);

  const [isSending, setIsSending] = useState(false);

  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setStatus(null);
  }, [safeLocale]);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!firstName || !lastName) {
      return t.missingName;
    }

    if (!email) {
      return t.missingEmail;
    }

    if (!isValidEmail(email)) {
      return t.invalidEmail;
    }

    if (!message) {
      return t.missingMessage;
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus(null);

    const validationMessage = validateForm();

    if (validationMessage) {
      setStatus({
        type: "error",
        message: validationMessage,
      });

      return;
    }

    setIsSending(true);

    try {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      const fullName = `${firstName} ${lastName}`.trim();

      await sendContactMessage({
        name: fullName,
        firstName,
        lastName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        country: t.defaultCountry,
        subjectType: "reservations",
        subject: t.defaultSubject,
        message: formData.message.trim(),
        lang: safeLocale,
      });

      setStatus({
        type: "success",
        message: t.success,
      });

      setFormData(initialFormData);
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

            <form
              onSubmit={handleSubmit}
              className="mt-10 w-full max-w-[426px]"
            >
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
                type="tel"
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
            <HoverMascotaVideo
              posterSrc="/contacto/pajaroto.png"
              videoSrc="/contacto/mascota.mp4"
              alt={t.imageAlt}
              animationLabel={t.animation}
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

interface HoverMascotaVideoProps {
  posterSrc: string;
  videoSrc: string;
  alt: string;
  animationLabel: string;
}

function HoverMascotaVideo({
  posterSrc,
  videoSrc,
  alt,
  animationLabel,
}: HoverMascotaVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showPoster, setShowPoster] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  async function playVideo() {
    const video = videoRef.current;

    if (!video || isPlaying) {
      return;
    }

    try {
      setIsPlaying(true);
      setShowPoster(false);

      video.currentTime = 0;
      video.muted = true;

      await video.play();
    } catch {
      setIsPlaying(false);
      setShowPoster(true);
    }
  }

  function handleVideoEnded() {
    const video = videoRef.current;

    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    setIsPlaying(false);
    setShowPoster(true);
  }

  return (
    <div
      onMouseEnter={playVideo}
      onClick={playVideo}
      className="group relative h-auto w-full max-w-[560px] cursor-pointer overflow-hidden rounded-[10px] shadow-[0_22px_60px_rgba(0,0,0,0.18)] md:min-h-[430px] lg:min-h-[520px]"
      aria-label={alt}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        muted
        playsInline
        preload="metadata"
        onEnded={handleVideoEnded}
        className="block h-full min-h-[430px] w-full object-cover lg:min-h-[520px]"
      />

      <Image
        src={posterSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 560px"
        className={`object-cover transition-opacity duration-300 ${
          showPoster ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {showPoster && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-[#073d5d] shadow-lg">
            {animationLabel}
          </div>
        </div>
      )}
    </div>
  );
}

interface FloatingInputProps {
  name: string;
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  className?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
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
        className="pointer-events-none absolute left-[10px] top-[9px] text-[11px] font-normal leading-none text-white/80 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-white/60 peer-focus:top-[9px] peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-white/80"
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
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
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
        className="pointer-events-none absolute left-[10px] top-[11px] text-[11px] font-normal leading-none text-white/80 transition-all duration-200 peer-placeholder-shown:top-[20px] peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-white/60 peer-focus:top-[11px] peer-focus:text-[11px] peer-focus:text-white/80"
      >
        {label}
      </label>
    </div>
  );
}
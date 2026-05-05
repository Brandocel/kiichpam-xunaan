"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface BookingContactFormProps {
  locale: "es" | "en";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  comments: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  contactError: string;
  loadingContact: boolean;
  onChange: (
    field:
      | "firstName"
      | "lastName"
      | "email"
      | "phone"
      | "country"
      | "comments",
    value: string
  ) => void;
  onToggleTerms: () => void;
  onTogglePrivacy: () => void;
}

type CountryOption = {
  code: string;
  flag: string;
  es: string;
  en: string;
};

const countries: CountryOption[] = [
  { code: "MX", flag: "🇲🇽", es: "México", en: "Mexico" },
  { code: "US", flag: "🇺🇸", es: "Estados Unidos", en: "United States" },
  { code: "CA", flag: "🇨🇦", es: "Canadá", en: "Canada" },
  { code: "AR", flag: "🇦🇷", es: "Argentina", en: "Argentina" },
  { code: "BR", flag: "🇧🇷", es: "Brasil", en: "Brazil" },
  { code: "CL", flag: "🇨🇱", es: "Chile", en: "Chile" },
  { code: "CO", flag: "🇨🇴", es: "Colombia", en: "Colombia" },
  { code: "CR", flag: "🇨🇷", es: "Costa Rica", en: "Costa Rica" },
  { code: "CU", flag: "🇨🇺", es: "Cuba", en: "Cuba" },
  {
    code: "DO",
    flag: "🇩🇴",
    es: "República Dominicana",
    en: "Dominican Republic",
  },
  { code: "EC", flag: "🇪🇨", es: "Ecuador", en: "Ecuador" },
  { code: "SV", flag: "🇸🇻", es: "El Salvador", en: "El Salvador" },
  { code: "GT", flag: "🇬🇹", es: "Guatemala", en: "Guatemala" },
  { code: "HN", flag: "🇭🇳", es: "Honduras", en: "Honduras" },
  { code: "NI", flag: "🇳🇮", es: "Nicaragua", en: "Nicaragua" },
  { code: "PA", flag: "🇵🇦", es: "Panamá", en: "Panama" },
  { code: "PY", flag: "🇵🇾", es: "Paraguay", en: "Paraguay" },
  { code: "PE", flag: "🇵🇪", es: "Perú", en: "Peru" },
  { code: "PR", flag: "🇵🇷", es: "Puerto Rico", en: "Puerto Rico" },
  { code: "UY", flag: "🇺🇾", es: "Uruguay", en: "Uruguay" },
  { code: "VE", flag: "🇻🇪", es: "Venezuela", en: "Venezuela" },
  { code: "ES", flag: "🇪🇸", es: "España", en: "Spain" },
  { code: "FR", flag: "🇫🇷", es: "Francia", en: "France" },
  { code: "DE", flag: "🇩🇪", es: "Alemania", en: "Germany" },
  { code: "IT", flag: "🇮🇹", es: "Italia", en: "Italy" },
  { code: "GB", flag: "🇬🇧", es: "Reino Unido", en: "United Kingdom" },
];

function getText(locale: "es" | "en") {
  return locale === "es"
    ? {
        title: "Ingresa tus datos personales",
        firstName: "Nombre(s)",
        lastName: "Apellido(s)",
        email: "Correo electrónico",
        phone: "Número telefónico",
        country: "País",
        searchCountry: "Buscar país",
        noCountry: "No encontramos ese país",
        comments: "Comentarios",
        terms: "He leído y aceptado Términos y Condiciones",
        privacy: "He leído y aceptado Políticas de privacidad",
        saving: "GUARDANDO...",
      }
    : {
        title: "Enter your personal information",
        firstName: "First name(s)",
        lastName: "Last name(s)",
        email: "Email address",
        phone: "Phone number",
        country: "Country",
        searchCountry: "Search country",
        noCountry: "Country not found",
        comments: "Comments",
        terms: "I have read and accepted Terms and Conditions",
        privacy: "I have read and accepted Privacy Policy",
        saving: "SAVING...",
      };
}

function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative h-[58px]">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="
          peer h-full w-full border-0 border-b border-[#B8B8B8]
          bg-transparent px-2 pt-5
          font-[var(--font-be-vietnam-pro)]
          text-[16px] text-[#005F74]
          outline-none
          transition-colors duration-300
          focus:border-[#C028B9]
        "
      />

      <label
        className="
          pointer-events-none absolute left-2 top-[22px]
          font-[var(--font-be-vietnam-pro)]
          text-[16px] text-[#9D9D9D]
          transition-all duration-300 ease-out
          peer-focus:top-[2px]
          peer-focus:text-[12px]
          peer-focus:font-semibold
          peer-focus:text-[#C028B9]
          peer-not-placeholder-shown:top-[2px]
          peer-not-placeholder-shown:text-[12px]
          peer-not-placeholder-shown:font-semibold
          peer-not-placeholder-shown:text-[#005F74]
        "
      >
        {label}
      </label>
    </div>
  );
}

function FloatingTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative h-[90px]">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        rows={3}
        className="
          peer h-full w-full resize-none border-0 border-b border-[#B8B8B8]
          bg-transparent px-2 pt-6
          font-[var(--font-be-vietnam-pro)]
          text-[16px] text-[#005F74]
          outline-none
          transition-colors duration-300
          focus:border-[#C028B9]
        "
      />

      <label
        className="
          pointer-events-none absolute left-2 top-[24px]
          font-[var(--font-be-vietnam-pro)]
          text-[16px] text-[#9D9D9D]
          transition-all duration-300 ease-out
          peer-focus:top-[2px]
          peer-focus:text-[12px]
          peer-focus:font-semibold
          peer-focus:text-[#C028B9]
          peer-not-placeholder-shown:top-[2px]
          peer-not-placeholder-shown:text-[12px]
          peer-not-placeholder-shown:font-semibold
          peer-not-placeholder-shown:text-[#005F74]
        "
      >
        {label}
      </label>
    </div>
  );
}

export default function BookingContactForm({
  locale,
  firstName,
  lastName,
  email,
  phone,
  country,
  comments,
  acceptedTerms,
  acceptedPrivacy,
  contactError,
  loadingContact,
  onChange,
  onToggleTerms,
  onTogglePrivacy,
}: BookingContactFormProps) {
  const t = getText(locale);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const formRootRef = useRef<HTMLDivElement | null>(null);
  const countryRef = useRef<HTMLDivElement | null>(null);

  const selectedCountry = countries.find(
    (item) => item.es === country || item.en === country || item.code === country
  );

  const filteredCountries = useMemo(() => {
    const search = countrySearch.trim().toLowerCase();

    if (!search) return countries;

    return countries.filter((item) => {
      const name = locale === "es" ? item.es : item.en;

      return (
        name.toLowerCase().includes(search) ||
        item.es.toLowerCase().includes(search) ||
        item.en.toLowerCase().includes(search) ||
        item.code.toLowerCase().includes(search)
      );
    });
  }, [countrySearch, locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (!isMobile) return;

    const timer = window.setTimeout(() => {
      formRootRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryRef.current &&
        !countryRef.current.contains(event.target as Node)
      ) {
        setCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const titleClass =
    "font-[var(--font-be-vietnam-pro)] text-[24px] font-semibold text-[#005F74]";

  return (
    <div ref={formRootRef} className="w-full scroll-mt-[90px] md:scroll-mt-0">
      <h2 className={`mb-8 ${titleClass}`}>{t.title}</h2>

      <div className="space-y-5">
        <FloatingInput
          label={t.firstName}
          value={firstName}
          onChange={(value) => onChange("firstName", value)}
        />

        <FloatingInput
          label={t.lastName}
          value={lastName}
          onChange={(value) => onChange("lastName", value)}
        />

        <FloatingInput
          label={t.email}
          type="email"
          value={email}
          onChange={(value) => onChange("email", value)}
        />

        <FloatingInput
          label={t.phone}
          type="tel"
          value={phone}
          onChange={(value) => onChange("phone", value)}
        />

        <div ref={countryRef} className="relative">
          <button
            type="button"
            onClick={() => setCountryOpen((prev) => !prev)}
            className="
              flex h-[58px] w-full items-end justify-between
              border-0 border-b border-[#B8B8B8]
              bg-transparent px-2 pb-[10px]
              font-[var(--font-be-vietnam-pro)]
              text-[16px] text-[#005F74]
              outline-none
              transition-colors duration-300
              focus:border-[#C028B9]
            "
          >
            <span
              className={[
                "flex items-center gap-2",
                selectedCountry || country ? "text-[#005F74]" : "text-[#9D9D9D]",
              ].join(" ")}
            >
              {selectedCountry ? (
                <>
                  <span className="text-[20px] leading-none">
                    {selectedCountry.flag}
                  </span>
                  <span>
                    {locale === "es" ? selectedCountry.es : selectedCountry.en}
                  </span>
                </>
              ) : country ? (
                <span>{country}</span>
              ) : (
                <span>{t.country}</span>
              )}
            </span>

            <ChevronDown
              size={20}
              className={[
                "mb-[2px] text-[#9D9D9D] transition-transform duration-300",
                countryOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </button>

          {countryOpen ? (
            <div
              className="
                absolute bottom-[66px] left-0 right-0 z-50
                max-h-[320px] overflow-hidden rounded-[14px]
                border border-[#D6D6D6]
                bg-white shadow-[0_18px_40px_rgba(0,0,0,0.16)]
                sm:max-h-[360px]
                md:max-h-[400px]
              "
            >
              <div className="flex items-center gap-2 border-b border-[#E6E6E6] px-4 py-3">
                <Search size={17} className="text-[#9D9D9D]" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder={t.searchCountry}
                  className="
                    h-8 w-full bg-transparent
                    font-[var(--font-be-vietnam-pro)]
                    text-[14px] text-[#005F74]
                    outline-none placeholder:text-[#9D9D9D]
                  "
                  autoFocus
                />
              </div>

              <div className="max-h-[230px] overflow-y-auto py-2 sm:max-h-[270px] md:max-h-[310px]">
                {filteredCountries.length ? (
                  filteredCountries.map((item) => {
                    const name = locale === "es" ? item.es : item.en;
                    const isSelected =
                      selectedCountry?.code === item.code || country === name;

                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          onChange("country", name);
                          setCountryOpen(false);
                          setCountrySearch("");
                        }}
                        className={[
                          "flex w-full items-center gap-3 px-4 py-3 text-left",
                          "font-[var(--font-be-vietnam-pro)] text-[15px]",
                          "transition-colors duration-200 hover:bg-[#F7E7F6]",
                          isSelected
                            ? "bg-[#F7E7F6] font-semibold text-[#C028B9]"
                            : "text-[#005F74]",
                        ].join(" ")}
                      >
                        <span className="text-[22px] leading-none">
                          {item.flag}
                        </span>

                        <span className="flex-1">{name}</span>

                        <span className="text-[12px] font-semibold text-[#9D9D9D]">
                          {item.code}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-4 py-5 text-center font-[var(--font-be-vietnam-pro)] text-[14px] text-[#9D9D9D]">
                    {t.noCountry}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <FloatingTextarea
          label={t.comments}
          value={comments}
          onChange={(value) => onChange("comments", value)}
        />

        <label className="flex items-center gap-3 text-[14px] text-[#6A6A6A]">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={onToggleTerms}
          />
          <span>{t.terms}</span>
        </label>

        <label className="flex items-center gap-3 text-[14px] text-[#6A6A6A]">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={onTogglePrivacy}
          />
          <span>{t.privacy}</span>
        </label>

        {contactError ? (
          <p className="text-sm font-semibold text-red-600">{contactError}</p>
        ) : null}

        {loadingContact ? (
          <p className="text-sm font-semibold text-[#C028B9]">{t.saving}</p>
        ) : null}
      </div>
    </div>
  );
}
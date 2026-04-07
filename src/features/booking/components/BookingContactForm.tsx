"use client";

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

function getText(locale: "es" | "en") {
  return locale === "es"
    ? {
        title: "Ingresa tus datos personales",
        firstName: "Nombre(s)",
        lastName: "Apellido(s)",
        email: "Correo electrónico",
        phone: "Número telefónico",
        country: "País",
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
        comments: "Comments",
        terms: "I have read and accepted Terms and Conditions",
        privacy: "I have read and accepted Privacy Policy",
        saving: "SAVING...",
      };
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

  const inputClass =
    "h-[44px] w-full border-0 border-b border-[#B8B8B8] bg-transparent px-2 font-[var(--font-be-vietnam-pro)] text-[16px] text-[#005F74] outline-none placeholder:text-[#9D9D9D]";
  const titleClass =
    "font-[var(--font-be-vietnam-pro)] text-[24px] font-semibold text-[#005F74]";

  return (
    <div className="w-full">
      <h2 className={`mb-8 ${titleClass}`}>{t.title}</h2>

      <div className="space-y-6">
        <input
          type="text"
          value={firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          placeholder={t.firstName}
          className={inputClass}
        />

        <input
          type="text"
          value={lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          placeholder={t.lastName}
          className={inputClass}
        />

        <input
          type="email"
          value={email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder={t.email}
          className={inputClass}
        />

        <input
          type="tel"
          value={phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder={t.phone}
          className={inputClass}
        />

        <input
          type="text"
          value={country}
          onChange={(e) => onChange("country", e.target.value)}
          placeholder={t.country}
          className={inputClass}
        />

        <textarea
          value={comments}
          onChange={(e) => onChange("comments", e.target.value)}
          placeholder={t.comments}
          rows={3}
          className="w-full resize-none border-0 border-b border-[#B8B8B8] bg-transparent px-2 py-2 font-[var(--font-be-vietnam-pro)] text-[16px] text-[#005F74] outline-none placeholder:text-[#9D9D9D]"
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
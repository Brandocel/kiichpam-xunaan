import type { BookingLocale, ReservationContactPayload } from "../types/booking.types";

export function validateBookingContact(
  payload: ReservationContactPayload,
  locale: BookingLocale
) {
  const errors: string[] = [];

  if (!payload.firstName.trim()) {
    errors.push(locale === "es" ? "El nombre es obligatorio" : "First name is required");
  }

  if (!payload.lastName.trim()) {
    errors.push(locale === "es" ? "El apellido es obligatorio" : "Last name is required");
  }

  if (!payload.email.trim()) {
    errors.push(locale === "es" ? "El correo es obligatorio" : "Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email.trim())) {
      errors.push(locale === "es" ? "El correo no es válido" : "Email is not valid");
    }
  }

  if (!payload.phone.trim()) {
    errors.push(locale === "es" ? "El teléfono es obligatorio" : "Phone is required");
  }

  if (!payload.country.trim()) {
    errors.push(locale === "es" ? "El país es obligatorio" : "Country is required");
  }

  return {
    valid: errors.length === 0,
    errors,
    firstError: errors[0] || "",
  };
}
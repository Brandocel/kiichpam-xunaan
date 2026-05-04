export type ContactLocale = "es" | "en";

export type ContactSubjectType =
  | "general"
  | "reservations"
  | "events"
  | "promotions"
  | "support";

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  subjectType: ContactSubjectType;
  subject?: string;
  message: string;
  lang: ContactLocale;
}

export interface ContactApiResponse {
  success: boolean;
  message: string;
  data?: {
    provider?: string;
    providerId?: string | null;
    to?: string;
    replyTo?: string;
  };
}
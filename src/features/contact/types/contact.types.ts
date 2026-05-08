export type ContactLocale = "es" | "en";

export type ContactSubjectType =
  | "reservations"
  | "general"
  | "support"
  | "packages"
  | string;

export type ContactFormPayload = {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  country?: string;
  subjectType?: ContactSubjectType;
  subject?: string;
  message: string;
  lang?: ContactLocale | string;
};

export type ContactApiPayload = {
  name: string;
  email: string;
  phone: string;
  country: string;
  subjectType: string;
  subject: string;
  message: string;
  lang: string;
};

export type ContactApiResponseData = {
  provider?: string;
  providerId?: string;
  to?: string;
  replyTo?: string;
};

export type ContactApiResponse = {
  success: boolean;
  message: string;
  data?: ContactApiResponseData | unknown;
};
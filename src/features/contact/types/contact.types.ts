export type ContactFormPayload = {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  country?: string;
  subjectType?: string;
  subject?: string;
  message: string;
  lang?: string;
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

export type ContactApiResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  createOxxoReference,
  createPaymentIntent,
  createReservation,
  getReservationByFolio,
  getReservationQuote,
  updateReservationContact,
} from "../services/booking.service";
import type {
  BookingLocale,
  BookingExtraInput,
  PaymentIntentData,
  PaymentMethodType,
  ReservationContactPayload,
  ReservationCreateRequest,
  ReservationQuoteData,
  ReservationQuoteRequest,
  ReservationRecord,
} from "../types/booking.types";
import {
  canQuoteBooking,
  needsBookingQuote,
  toApiVisitDate,
} from "../utils/booking-calculations";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

type BookingStep = 1 | 2 | 3 | 4;

interface UseBookingParams {
  locale: BookingLocale;
  initialPackageCode?: string;
}

interface BookingDraftStorage {
  form: {
    packageCode: string;
    visitDate: string;
    adults: number;
    children: number;
    infants: number;
    inapamVisitors: number;
    couponCode: string;
    extras: BookingExtraInput[];
    locale: BookingLocale;
  };
  reservation: {
    folio: string;
    currentStep: BookingStep;
    data: ReservationRecord | null;
    quote: ReservationQuoteData | null;
    paymentIntent: PaymentIntentData | null;
  };
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    comments: string;
    acceptedTerms: boolean;
    acceptedPrivacy: boolean;
  };
  updatedAt: string;
}

const BOOKING_DRAFT_STORAGE_KEY = "kiichpam_xunaan_booking_draft_v2";

function safeReadDraft(): BookingDraftStorage | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(BOOKING_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraftStorage;
  } catch {
    return null;
  }
}

function safeWriteDraft(data: BookingDraftStorage) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch {
    // ignore
  }
}

function clearStoredDraft() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(BOOKING_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function normalizeExtras(extras: BookingExtraInput[] = []) {
  return [...extras]
    .filter((item) => item.code?.trim() && item.qty > 0)
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((item) => ({
      code: item.code.trim(),
      qty: item.qty,
    }));
}

function buildReservationSignature(input: {
  packageCode: string;
  visitDate: string;
  adults: number;
  children: number;
  infants: number;
  inapamVisitors: number;
  couponCode: string;
  locale: BookingLocale;
  extras?: BookingExtraInput[];
}) {
  return JSON.stringify({
    packageCode: input.packageCode.trim(),
    visitDate: input.visitDate.trim(),
    adults: input.adults,
    children: input.children,
    infants: input.infants,
    inapamVisitors: input.inapamVisitors,
    couponCode: input.couponCode.trim().toUpperCase(),
    locale: input.locale,
    extras: normalizeExtras(input.extras),
  });
}

export function useBooking({
  locale,
  initialPackageCode = "",
}: UseBookingParams) {
  const hydratedRef = useRef(false);
  const restoringRef = useRef(false);

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);

  const [packageCode, setPackageCodeState] = useState(initialPackageCode);
  const [visitDate, setVisitDateState] = useState("");
  const [adults, setAdultsState] = useState(1);
  const [children, setChildrenState] = useState(0);
  const [infants, setInfantsState] = useState(0);
  const [inapamVisitors, setInapamVisitorsState] = useState(0);
  const [couponCode, setCouponCodeState] = useState("");
  const [extras] = useState<BookingExtraInput[]>([]);

  const [quote, setQuote] = useState<ReservationQuoteData | null>(null);
  const [reservation, setReservation] = useState<ReservationRecord | null>(null);
  const [folio, setFolio] = useState("");

  const [paymentMethod, setPaymentMethodState] =
    useState<PaymentMethodType>("card");
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentData | null>(
    null
  );

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingReservation, setLoadingReservation] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingRecovery, setLoadingRecovery] = useState(false);

  const [quoteError, setQuoteError] = useState("");
  const [reservationError, setReservationError] = useState("");
  const [contactError, setContactError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [comments, setComments] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const currentSignature = useMemo(() => {
    return buildReservationSignature({
      packageCode,
      visitDate: toApiVisitDate(visitDate || ""),
      adults,
      children,
      infants,
      inapamVisitors,
      couponCode,
      locale,
      extras,
    });
  }, [
    packageCode,
    visitDate,
    adults,
    children,
    infants,
    inapamVisitors,
    couponCode,
    locale,
    extras,
  ]);

  const canQuote = useMemo(() => {
    return canQuoteBooking({
      packageCode,
      visitDate,
      adults,
    });
  }, [packageCode, visitDate, adults]);

  const shouldRequestQuote = useMemo(() => {
    return needsBookingQuote({
      couponCode,
      inapamVisitors,
    });
  }, [couponCode, inapamVisitors]);

  const canSubmitContact = useMemo(() => {
    return Boolean(
      folio &&
        firstName.trim() &&
        lastName.trim() &&
        email.trim() &&
        phone.trim() &&
        country.trim() &&
        acceptedTerms &&
        acceptedPrivacy
    );
  }, [
    folio,
    firstName,
    lastName,
    email,
    phone,
    country,
    acceptedTerms,
    acceptedPrivacy,
  ]);

  const canGeneratePayment = useMemo(() => {
    return Boolean(folio && reservation && currentStep === 3);
  }, [folio, reservation, currentStep]);

  const isProcessingStepOne =
    loadingQuote || loadingReservation || loadingRecovery;

  const persistDraft = useCallback(() => {
    if (!hydratedRef.current || restoringRef.current) return;

    const draft: BookingDraftStorage = {
      form: {
        packageCode,
        visitDate,
        adults,
        children,
        infants,
        inapamVisitors,
        couponCode,
        extras,
        locale,
      },
      reservation: {
        folio,
        currentStep,
        data: reservation,
        quote,
        paymentIntent,
      },
      contact: {
        firstName,
        lastName,
        email,
        phone,
        country,
        comments,
        acceptedTerms,
        acceptedPrivacy,
      },
      updatedAt: new Date().toISOString(),
    };

    safeWriteDraft(draft);
  }, [
    packageCode,
    visitDate,
    adults,
    children,
    infants,
    inapamVisitors,
    couponCode,
    extras,
    locale,
    folio,
    currentStep,
    reservation,
    quote,
    paymentIntent,
    firstName,
    lastName,
    email,
    phone,
    country,
    comments,
    acceptedTerms,
    acceptedPrivacy,
  ]);

  const resetReservationStateOnly = useCallback(() => {
    setQuote(null);
    setReservation(null);
    setFolio("");
    setPaymentIntent(null);
    setCurrentStep(1);
    setQuoteError("");
    setReservationError("");
    setContactError("");
    setPaymentError("");
  }, []);

  const resetAllFlow = useCallback(() => {
    setCurrentStep(1);

    setPackageCodeState(initialPackageCode);
    setVisitDateState("");
    setAdultsState(1);
    setChildrenState(0);
    setInfantsState(0);
    setInapamVisitorsState(0);
    setCouponCodeState("");

    setQuote(null);
    setReservation(null);
    setFolio("");
    setPaymentIntent(null);
    setPaymentMethodState("card");

    setQuoteError("");
    setReservationError("");
    setContactError("");
    setPaymentError("");

    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCountry("");
    setComments("");
    setAcceptedTerms(false);
    setAcceptedPrivacy(false);

    clearStoredDraft();
  }, [initialPackageCode]);

  async function recoverReservationFromDraft(stored: BookingDraftStorage) {
    const storedFolio = stored.reservation?.folio;

    if (!storedFolio) return;

    try {
      setLoadingRecovery(true);
      setReservationError("");

      const result = await getReservationByFolio(storedFolio);

      if (!result.success || !result.data) {
        throw new Error(result.message || "No se pudo recuperar la reservación");
      }

      setReservation(result.data);
      setFolio(result.data.folio);
      setQuote(stored.reservation?.quote ?? null);
      setPaymentIntent(stored.reservation?.paymentIntent ?? null);

      const step =
        stored.reservation?.currentStep && stored.reservation.currentStep >= 1
          ? stored.reservation.currentStep
          : 1;

      setCurrentStep(step);
    } catch {
      setReservation(null);
      setFolio("");
      setQuote(null);
      setPaymentIntent(null);
      setCurrentStep(1);
    } finally {
      setLoadingRecovery(false);
    }
  }

  useEffect(() => {
    if (hydratedRef.current) return;

    const stored = safeReadDraft();

    if (!stored) {
      hydratedRef.current = true;
      return;
    }

    restoringRef.current = true;

    setPackageCodeState(stored.form?.packageCode || initialPackageCode || "");
    setVisitDateState(stored.form?.visitDate || "");
    setAdultsState(stored.form?.adults ?? 1);
    setChildrenState(stored.form?.children ?? 0);
    setInfantsState(stored.form?.infants ?? 0);
    setInapamVisitorsState(stored.form?.inapamVisitors ?? 0);
    setCouponCodeState(stored.form?.couponCode || "");

    setFirstName(stored.contact?.firstName || "");
    setLastName(stored.contact?.lastName || "");
    setEmail(stored.contact?.email || "");
    setPhone(stored.contact?.phone || "");
    setCountry(stored.contact?.country || "");
    setComments(stored.contact?.comments || "");
    setAcceptedTerms(stored.contact?.acceptedTerms ?? false);
    setAcceptedPrivacy(stored.contact?.acceptedPrivacy ?? false);

    setPaymentIntent(stored.reservation?.paymentIntent ?? null);
    setQuote(stored.reservation?.quote ?? null);

    hydratedRef.current = true;
    restoringRef.current = false;

    void recoverReservationFromDraft(stored);
  }, [initialPackageCode]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    persistDraft();
  }, [persistDraft]);

  function invalidateReservationIfCoreChanged(next?: {
    packageCode?: string;
    visitDate?: string;
    couponCode?: string;
  }) {
    const nextPackageCode = next?.packageCode ?? packageCode;
    const nextVisitDate = next?.visitDate ?? visitDate;
    const nextCouponCode = next?.couponCode ?? couponCode;

    const nextSignature = buildReservationSignature({
      packageCode: nextPackageCode,
      visitDate: toApiVisitDate(nextVisitDate || ""),
      adults,
      children,
      infants,
      inapamVisitors,
      couponCode: nextCouponCode,
      locale,
      extras,
    });

    if (folio && nextSignature !== currentSignature) {
      resetReservationStateOnly();
    }
  }

  function setPackageCode(value: string) {
    invalidateReservationIfCoreChanged({ packageCode: value });
    setPackageCodeState(value);
    setQuote(null);
    setQuoteError("");
  }

  function setVisitDate(value: string) {
    invalidateReservationIfCoreChanged({ visitDate: value });
    setVisitDateState(value);
    setQuote(null);
    setQuoteError("");
  }

  function setCouponCode(value: string) {
    invalidateReservationIfCoreChanged({ couponCode: value });
    setCouponCodeState(value);
    setQuote(null);
    setQuoteError("");
  }

  function setPaymentMethod(method: PaymentMethodType) {
    setPaymentMethodState(method);
    setPaymentError("");
  }

  async function fetchQuote() {
    if (!canQuote) return null;

    try {
      setLoadingQuote(true);
      setQuoteError("");

      const payload: ReservationQuoteRequest = {
        packageCode,
        visitDate: toApiVisitDate(visitDate),
        adults,
        children,
        infants,
        inapamVisitors,
        couponCode: couponCode.trim() || undefined,
        lang: locale,
        extras,
      };

      const result = await getReservationQuote(payload);

      if (!result.success || !result.data) {
        throw new Error(result.message || "No se recibió cotización");
      }

      setQuote(result.data);
      return result.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al cotizar";

      setQuoteError(message);
      setQuote(null);
      return null;
    } finally {
      setLoadingQuote(false);
    }
  }

  async function tryReuseExistingReservation() {
    const stored = safeReadDraft();
    if (!stored?.reservation?.folio) return null;

    const storedSignature = buildReservationSignature({
      packageCode: stored.form?.packageCode || "",
      visitDate: toApiVisitDate(stored.form?.visitDate || ""),
      adults: stored.form?.adults ?? 1,
      children: stored.form?.children ?? 0,
      infants: stored.form?.infants ?? 0,
      inapamVisitors: stored.form?.inapamVisitors ?? 0,
      couponCode: stored.form?.couponCode || "",
      locale: stored.form?.locale || locale,
      extras: stored.form?.extras || [],
    });

    if (storedSignature !== currentSignature) {
      return null;
    }

    try {
      const result = await getReservationByFolio(stored.reservation.folio);

      if (!result.success || !result.data) {
        return null;
      }

      setReservation(result.data);
      setFolio(result.data.folio);
      setCurrentStep(
        stored.reservation.currentStep >= 2
          ? stored.reservation.currentStep
          : 2
      );
      setQuote(stored.reservation.quote ?? quote);
      setPaymentIntent(stored.reservation.paymentIntent ?? paymentIntent);

      return result.data;
    } catch {
      return null;
    }
  }

  async function createDraftReservation() {
    if (!canQuote) return null;

    const reused = await tryReuseExistingReservation();
    if (reused) {
      return reused;
    }

    try {
      setLoadingReservation(true);
      setReservationError("");

      const payload: ReservationCreateRequest = {
        packageCode,
        visitDate: toApiVisitDate(visitDate),
        adults,
        children,
        infants,
        inapamVisitors,
        couponCode: couponCode.trim() || undefined,
        lang: locale,
        extras,
      };

      const result = await createReservation(payload);

      if (!result.success || !result.data) {
        throw new Error(result.message || "No se pudo crear la reservación");
      }

      setReservation(result.data);
      setFolio(result.data.folio);
      setCurrentStep(2);

      return result.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear reservación";

      setReservationError(message);
      return null;
    } finally {
      setLoadingReservation(false);
    }
  }

  function setContactField(
    field: "firstName" | "lastName" | "email" | "phone" | "country" | "comments",
    value: string
  ) {
    setContactError("");

    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "country":
        setCountry(value);
        break;
      case "comments":
        setComments(value);
        break;
    }
  }

  async function submitContact() {
    if (!folio) {
      setContactError("No se encontró el folio de la reservación");
      return null;
    }

    if (!canSubmitContact) {
      setContactError("Completa todos los campos obligatorios");
      return null;
    }

    try {
      setLoadingContact(true);
      setContactError("");

      const payload: ReservationContactPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        comments: comments.trim() || "",
      };

      const result = await updateReservationContact(folio, payload);

      if (!result.success || !result.data) {
        throw new Error(result.message || "No se pudieron guardar los datos");
      }

      setReservation(result.data);
      setCurrentStep(3);

      return result.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al guardar contacto";

      setContactError(message);
      return null;
    } finally {
      setLoadingContact(false);
    }
  }

  async function generateCardPaymentIntent() {
    if (!folio) {
      setPaymentError("No se encontró el folio para generar el pago");
      return null;
    }

    try {
      setLoadingPayment(true);
      setPaymentError("");

      const result = await createPaymentIntent({
        folio,
        method: "card",
      });

      if (!result.success || !result.data) {
        throw new Error(result.message || "No se pudo iniciar el pago con tarjeta");
      }

      const nextPaymentIntent: PaymentIntentData = {
        ...result.data,
        paymentMethod: "card",
      };

      setPaymentIntent(nextPaymentIntent);

      if (!result.data.stripe?.clientSecret) {
        throw new Error("No se recibió clientSecret para el pago con tarjeta");
      }

      return result.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al generar el pago con tarjeta";

      setPaymentError(message);
      return null;
    } finally {
      setLoadingPayment(false);
    }
  }

  async function confirmCardPayment() {
    try {
      setLoadingPayment(true);
      setPaymentError("");

      if (!paymentIntent?.stripe?.clientSecret) {
        const createdIntent = await generateCardPaymentIntent();
        if (!createdIntent?.stripe?.clientSecret) return null;
      }

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo confirmar el pago con tarjeta";

      setPaymentError(message);
      return null;
    } finally {
      setLoadingPayment(false);
    }
  }

  async function generateOxxoPayment() {
    if (!folio) {
      setPaymentError("No se encontró el folio para generar el pago OXXO");
      return null;
    }

    try {
      setLoadingPayment(true);
      setPaymentError("");

      const result = await createOxxoReference({
        folio,
        method: "oxxo",
      });

      if (!result.success || !result.data) {
        throw new Error(result.message || "No se pudo generar el pago OXXO");
      }

      const nextPaymentIntent: PaymentIntentData = {
        ...result.data,
        paymentMethod: "oxxo",
      };

      setPaymentIntent(nextPaymentIntent);

      if (
        result.data.reference ||
        result.data.hostedVoucherUrl ||
        result.data.expiresAt
      ) {
        setCurrentStep(4);
      } else {
        throw new Error(
          "El backend no devolvió referencia OXXO. Revisa la respuesta del endpoint /payments/oxxo-reference."
        );
      }

      return result.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al generar pago OXXO";

      setPaymentError(message);
      return null;
    } finally {
      setLoadingPayment(false);
    }
  }

  async function handlePrimaryAction() {
    if (currentStep === 1) {
      if (!canQuote) {
        setQuoteError(
          locale === "es"
            ? "Completa paquete, fecha y al menos un adulto."
            : "Complete package, date and at least one adult."
        );
        return;
      }

      if (shouldRequestQuote) {
        if (!quote) {
          await fetchQuote();
          return;
        }

        if (!reservation) {
          await createDraftReservation();
          return;
        }

        setCurrentStep(2);
        return;
      }

      if (!reservation) {
        await createDraftReservation();
        return;
      }

      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      await submitContact();
      return;
    }

    if (currentStep === 3) {
      if (paymentMethod === "card") {
        await generateCardPaymentIntent();
        return;
      }

      await generateOxxoPayment();
    }
  }

  function increment(type: "adults" | "children" | "infants" | "inapam") {
    setQuote(null);
    setQuoteError("");
    resetReservationStateOnly();

    if (type === "adults") {
      setAdultsState((prev) => prev + 1);
      return;
    }

    if (type === "children") {
      setChildrenState((prev) => prev + 1);
      return;
    }

    if (type === "infants") {
      setInfantsState((prev) => prev + 1);
      return;
    }

    setInapamVisitorsState((prev) => Math.min(prev + 1, adults));
  }

  function decrement(type: "adults" | "children" | "infants" | "inapam") {
    setQuote(null);
    setQuoteError("");
    resetReservationStateOnly();

    if (type === "adults") {
      setAdultsState((prevAdults) => {
        const nextAdults = Math.max(1, prevAdults - 1);
        setInapamVisitorsState((prevInapam) => Math.min(prevInapam, nextAdults));
        return nextAdults;
      });
      return;
    }

    if (type === "children") {
      setChildrenState((prev) => Math.max(0, prev - 1));
      return;
    }

    if (type === "infants") {
      setInfantsState((prev) => Math.max(0, prev - 1));
      return;
    }

    setInapamVisitorsState((prev) => Math.max(0, prev - 1));
  }

  function handleCardPaymentSucceeded(
    paymentIntentId?: string,
    status?: string
  ) {
    setPaymentIntent((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        status: status || "SUCCEEDED",
        stripe: {
          ...prev.stripe,
          paymentIntentId: paymentIntentId || prev.stripe?.paymentIntentId,
          status: status || "succeeded",
        },
      };
    });

    setPaymentError("");
    setCurrentStep(4);
  }

  return {
    stripePromise,
    currentStep,
    packageCode,
    setPackageCode,
    visitDate,
    setVisitDate,
    adults,
    children,
    infants,
    inapamVisitors,
    couponCode,
    setCouponCode,
    quote,
    reservation,
    folio,
    paymentMethod,
    setPaymentMethod,
    paymentIntent,
    loadingQuote,
    loadingReservation,
    loadingContact,
    loadingPayment,
    loadingRecovery,
    quoteError,
    reservationError,
    contactError,
    paymentError,
    canQuote,
    shouldRequestQuote,
    canSubmitContact,
    canGeneratePayment,
    isProcessingStepOne,
    firstName,
    lastName,
    email,
    phone,
    country,
    comments,
    acceptedTerms,
    acceptedPrivacy,
    setContactField,
    setAcceptedTerms,
    setAcceptedPrivacy,
    fetchQuote,
    createDraftReservation,
    submitContact,
    generateCardPaymentIntent,
    confirmCardPayment,
    generateOxxoPayment,
    handlePrimaryAction,
    increment,
    decrement,
    handleCardPaymentSucceeded,
    resetAllFlow,
  };
}
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createOxxoReference,
  createPaymentIntent,
  createReservation,
  getReservationByFolio,
  getReservationQuote,
  updateReservationContact,
} from "../services/booking.service";
import type {
  BookingDraftStorage,
  BookingExtraInput,
  BookingLocale,
  PaymentIntentData,
  PaymentMethodType,
  ReservationContactPayload,
  ReservationCreateRequest,
  ReservationQuoteData,
  ReservationQuoteRequest,
  ReservationRecord,
} from "../types/booking.types";
import {
  buildBookingSignature,
  canQuoteBooking,
  normalizeExtras,
  normalizeCouponCode,
  shouldFetchBookingQuote,
  toApiVisitDate,
} from "../utils/booking-calculations";
import { validateBookingContact } from "../utils/booking-validators";

type BookingStep = 1 | 2 | 3 | 4;

interface UseBookingParams {
  locale: BookingLocale;
  initialPackageCode?: string;
}

const BOOKING_DRAFT_STORAGE_KEY = "kiichpam_xunaan_booking_draft_v3";

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
    //
  }
}

function clearStoredDraft() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(BOOKING_DRAFT_STORAGE_KEY);
  } catch {
    //
  }
}

export function useBooking({
  locale,
  initialPackageCode = "",
}: UseBookingParams) {
  const hydratedRef = useRef(false);
  const restoringRef = useRef(false);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  
  function goToStep(step: 1 | 2 | 3 | 4) {
    if (step >= currentStep) return;
  
    if (step === 1) {
      setContactError("");
      setPaymentError("");
    }
  
    if (step === 2) {
      setPaymentError("");
    }
  
    setCurrentStep(step);
  }
  

  const [packageCode, setPackageCodeState] = useState(initialPackageCode);
  const [visitDate, setVisitDateState] = useState("");
  const [adults, setAdultsState] = useState(1);
  const [children, setChildrenState] = useState(0);
  const [infants, setInfantsState] = useState(0);
  const [inapamVisitors, setInapamVisitorsState] = useState(0);
  const [couponCode, setCouponCodeState] = useState("");
  const [extras, setExtras] = useState<BookingExtraInput[]>([]);

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

  const apiVisitDate = useMemo(() => toApiVisitDate(visitDate), [visitDate]);

  const currentSignature = useMemo(() => {
    return buildBookingSignature({
      packageCode,
      visitDate: apiVisitDate,
      adults,
      children,
      infants,
      inapamVisitors,
      couponCode,
      lang: locale,
      extras,
    });
  }, [
    packageCode,
    apiVisitDate,
    adults,
    children,
    infants,
    inapamVisitors,
    couponCode,
    locale,
    extras,
  ]);

  const [quoteSignature, setQuoteSignature] = useState("");
  const [reservationSignature, setReservationSignature] = useState("");

  const canQuote = useMemo(() => {
    return canQuoteBooking({
      packageCode,
      visitDate,
      adults,
      children,
      infants,
    });
  }, [packageCode, visitDate, adults, children, infants]);

  const shouldRequestQuote = useMemo(() => {
    return shouldFetchBookingQuote({
      packageCode,
      visitDate,
      adults,
      children,
      infants,
    });
  }, [packageCode, visitDate, adults, children, infants]);


  
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

  const hasFreshQuote = Boolean(quote && quoteSignature === currentSignature);
  const hasFreshReservation = Boolean(
    reservation && reservationSignature === currentSignature && folio
  );

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
        quoteSignature,
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
    quoteSignature,
    firstName,
    lastName,
    email,
    phone,
    country,
    comments,
    acceptedTerms,
    acceptedPrivacy,
  ]);

  const invalidateQuoteReservationAndPayment = useCallback(() => {
    setQuote(null);
    setReservation(null);
    setFolio("");
    setPaymentIntent(null);
    setQuoteSignature("");
    setReservationSignature("");
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
    setExtras([]);

    setQuote(null);
    setReservation(null);
    setFolio("");
    setPaymentIntent(null);
    setPaymentMethodState("card");

    setQuoteSignature("");
    setReservationSignature("");

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

      const result = await getReservationByFolio(storedFolio);

      if (!result.success || !result.data) {
        throw new Error(result.message || "No se pudo recuperar la reservación");
      }

      setReservation(result.data);
      setFolio(result.data.folio);
      setQuote(stored.reservation?.quote ?? null);
      setPaymentIntent(stored.reservation?.paymentIntent ?? null);
      setQuoteSignature(stored.reservation?.quoteSignature ?? "");
      setReservationSignature(stored.reservation?.quoteSignature ?? "");

      const nextStep =
        stored.reservation?.currentStep && stored.reservation.currentStep >= 1
          ? stored.reservation.currentStep
          : 1;

      setCurrentStep(nextStep);
    } catch {
      setReservation(null);
      setFolio("");
      setQuote(null);
      setPaymentIntent(null);
      setQuoteSignature("");
      setReservationSignature("");
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
    setExtras(stored.form?.extras ?? []);

    setFirstName(stored.contact?.firstName || "");
    setLastName(stored.contact?.lastName || "");
    setEmail(stored.contact?.email || "");
    setPhone(stored.contact?.phone || "");
    setCountry(stored.contact?.country || "");
    setComments(stored.contact?.comments || "");
    setAcceptedTerms(stored.contact?.acceptedTerms ?? false);
    setAcceptedPrivacy(stored.contact?.acceptedPrivacy ?? false);

    hydratedRef.current = true;
    restoringRef.current = false;

    void recoverReservationFromDraft(stored);
  }, [initialPackageCode]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    persistDraft();
  }, [persistDraft]);

  function setPackageCode(value: string) {
    if (value !== packageCode) {
      invalidateQuoteReservationAndPayment();
      setPackageCodeState(value);
    }
  }

  function setVisitDate(value: string) {
    if (value !== visitDate) {
      invalidateQuoteReservationAndPayment();
      setVisitDateState(value);
    }
  }

  function setCouponCode(value: string) {
    if (value !== couponCode) {
      invalidateQuoteReservationAndPayment();
      setCouponCodeState(value);
    }
  }

  function setPaymentMethod(method: PaymentMethodType) {
    setPaymentMethodState(method);
    setPaymentError("");
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

  async function fetchQuote() {
    if (!canQuote) return null;

    try {
      setLoadingQuote(true);
      setQuoteError("");

      const payload: ReservationQuoteRequest = {
        packageCode,
        visitDate: apiVisitDate,
        adults,
        children,
        infants,
        inapamVisitors,
        couponCode: normalizeCouponCode(couponCode) || undefined,
        lang: locale,
        extras: normalizeExtras(extras),
      };

      const result = await getReservationQuote(payload);

      if (!result.success || !result.data) {
        throw new Error(result.message || "No se recibió cotización");
      }

      setQuote(result.data);
      setQuoteSignature(currentSignature);

      return result.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al cotizar";

      setQuoteError(message);
      setQuote(null);
      setQuoteSignature("");
      return null;
    } finally {
      setLoadingQuote(false);
    }
  }

  async function createDraftReservation() {
    if (!canQuote) {
      setReservationError(
        locale === "es"
          ? "Completa paquete, fecha y al menos un visitante."
          : "Complete package, date and at least one visitor."
      );
      return null;
    }

    try {
      setLoadingReservation(true);
      setReservationError("");

      const payload: ReservationCreateRequest = {
        packageCode,
        visitDate: apiVisitDate,
        adults,
        children,
        infants,
        inapamVisitors,
        couponCode: normalizeCouponCode(couponCode) || undefined,
        lang: locale,
        extras: normalizeExtras(extras),
      };

      const result = await createReservation(payload);

      if (!result.success || !result.data) {
        throw new Error(result.message || "No se pudo crear la reservación");
      }

      setReservation(result.data);
      setFolio(result.data.folio);
      setReservationSignature(currentSignature);
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

  async function submitContact() {
    if (!folio) {
      setContactError(
        locale === "es"
          ? "No se encontró el folio de la reservación"
          : "Reservation folio was not found"
      );
      return null;
    }

    const payload: ReservationContactPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country: country.trim(),
      comments: comments.trim() || "",
    };

    const validation = validateBookingContact(payload, locale);

    if (!acceptedTerms || !acceptedPrivacy) {
      setContactError(
        locale === "es"
          ? "Debes aceptar términos y políticas de privacidad"
          : "You must accept terms and privacy policy"
      );
      return null;
    }

    if (!validation.valid) {
      setContactError(validation.firstError);
      return null;
    }

    try {
      setLoadingContact(true);
      setContactError("");

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
      setPaymentError(
        locale === "es"
          ? "No se encontró el folio para generar el pago"
          : "Reservation folio was not found"
      );
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
      setPaymentError(
        locale === "es"
          ? "No se encontró el folio para generar el pago OXXO"
          : "Reservation folio was not found for OXXO payment"
      );
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
          "El backend no devolvió referencia OXXO. Revisa el endpoint /payments/oxxo-reference."
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
            ? "Completa paquete, fecha y al menos un visitante."
            : "Complete package, date and at least one visitor."
        );
        return;
      }

      if (!hasFreshQuote) {
        await fetchQuote();
        return;
      }

      if (!hasFreshReservation) {
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
    invalidateQuoteReservationAndPayment();

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
    invalidateQuoteReservationAndPayment();

    if (type === "adults") {
      setAdultsState((prevAdults) => {
        const nextAdults = Math.max(0, prevAdults - 1);
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

    extras,
    setExtras,

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
    hasFreshQuote,
    hasFreshReservation,

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
    goToStep
  };
}
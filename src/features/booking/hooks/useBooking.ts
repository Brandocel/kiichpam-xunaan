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

interface UseBookingParams {
  locale: BookingLocale;
  initialPackageCode?: string;
  initialCampaignCode?: string;
  initialCampaignByPackageCode?: Record<string, string>;
  initialAdults?: number;
  initialChildren?: number;
  initialInfants?: number;
}

type BookingDraftStorageWithCampaign = BookingDraftStorage & {
  form: BookingDraftStorage["form"] & {
    campaignCode?: string;
    campaignByPackageCode?: Record<string, string>;
  };
};

const BOOKING_DRAFT_STORAGE_KEY = "kiichpam_xunaan_booking_draft_v3";

function normalizeCode(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

function normalizeCampaignMap(map?: Record<string, string>) {
  if (!map) return {};

  return Object.fromEntries(
    Object.entries(map)
      .map(([packageCode, campaignCode]) => [
        normalizeCode(packageCode),
        normalizeCode(campaignCode),
      ])
      .filter(([packageCode, campaignCode]) => packageCode && campaignCode)
  );
}

function safeReadDraft(): BookingDraftStorageWithCampaign | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(BOOKING_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraftStorageWithCampaign;
  } catch {
    return null;
  }
}

function safeWriteDraft(data: BookingDraftStorageWithCampaign) {
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

function getReadableErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

/**
 * Ya no usamos alert() del navegador.
 * Los mensajes se guardan en quoteError, reservationError, contactError o paymentError.
 * BookingSection los muestra con una tarjeta visual elegante.
 */
function showBookingError(_message: string) {
  return;
}

export function useBooking({
  locale,
  initialPackageCode = "",
  initialCampaignCode = "",
  initialCampaignByPackageCode = {},
  initialAdults = 1,
  initialChildren = 0,
  initialInfants = 0,
}: UseBookingParams) {
  const hydratedRef = useRef(false);
  const restoringRef = useRef(false);
  const lastInitialValuesRef = useRef("");

  const normalizedInitialCampaignByPackageCode = useMemo(
    () => normalizeCampaignMap(initialCampaignByPackageCode),
    [initialCampaignByPackageCode]
  );

  const normalizedInitialPackageCode = useMemo(
    () => normalizeCode(initialPackageCode),
    [initialPackageCode]
  );

  const normalizedInitialCampaignCode = useMemo(
    () => normalizeCode(initialCampaignCode),
    [initialCampaignCode]
  );

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [packageCode, setPackageCodeState] = useState(
    normalizedInitialPackageCode
  );

  const [campaignCode, setCampaignCodeState] = useState(
    normalizedInitialCampaignCode
  );

  const [campaignByPackageCode, setCampaignByPackageCode] =
    useState<Record<string, string>>(normalizedInitialCampaignByPackageCode);

  const [visitDate, setVisitDateState] = useState("");
  const [adults, setAdultsState] = useState(initialAdults);
  const [children, setChildrenState] = useState(initialChildren);
  const [infants, setInfantsState] = useState(initialInfants);
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

  const initialValuesSignature = useMemo(() => {
    return JSON.stringify({
      initialPackageCode: normalizedInitialPackageCode,
      initialCampaignCode: normalizedInitialCampaignCode,
      initialCampaignByPackageCode: normalizedInitialCampaignByPackageCode,
      initialAdults,
      initialChildren,
      initialInfants,
    });
  }, [
    normalizedInitialPackageCode,
    normalizedInitialCampaignCode,
    normalizedInitialCampaignByPackageCode,
    initialAdults,
    initialChildren,
    initialInfants,
  ]);

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
      campaignCode,
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
    campaignCode,
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

  const persistDraft = useCallback(() => {
    if (!hydratedRef.current || restoringRef.current) return;

    const draft: BookingDraftStorageWithCampaign = {
      form: {
        packageCode,
        campaignCode,
        campaignByPackageCode,
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
    campaignCode,
    campaignByPackageCode,
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

    setPackageCodeState(normalizedInitialPackageCode);
    setCampaignCodeState(normalizedInitialCampaignCode);
    setCampaignByPackageCode(normalizedInitialCampaignByPackageCode);
    setVisitDateState("");
    setAdultsState(initialAdults);
    setChildrenState(initialChildren);
    setInfantsState(initialInfants);
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
  }, [
    normalizedInitialPackageCode,
    normalizedInitialCampaignCode,
    normalizedInitialCampaignByPackageCode,
    initialAdults,
    initialChildren,
    initialInfants,
  ]);

  async function recoverReservationFromDraft(
    stored: BookingDraftStorageWithCampaign
  ) {
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
    const hasInitialCampaign = Boolean(normalizedInitialCampaignCode);

    if (!stored || hasInitialCampaign) {
      clearStoredDraft();

      hydratedRef.current = true;
      lastInitialValuesRef.current = initialValuesSignature;

      setPackageCodeState(normalizedInitialPackageCode);
      setCampaignCodeState(normalizedInitialCampaignCode);
      setCampaignByPackageCode(normalizedInitialCampaignByPackageCode);
      setVisitDateState("");
      setAdultsState(initialAdults);
      setChildrenState(initialChildren);
      setInfantsState(initialInfants);
      setInapamVisitorsState(0);
      setCouponCodeState("");
      setExtras([]);

      return;
    }

    restoringRef.current = true;

    const storedPackageCode = normalizeCode(stored.form?.packageCode);
    const storedCampaignCode = normalizeCode(stored.form?.campaignCode);
    const storedCampaignMap = normalizeCampaignMap(
      stored.form?.campaignByPackageCode
    );

    setPackageCodeState(storedPackageCode || normalizedInitialPackageCode);
    setCampaignCodeState(storedCampaignCode || normalizedInitialCampaignCode);
    setCampaignByPackageCode(
      Object.keys(storedCampaignMap).length > 0
        ? storedCampaignMap
        : normalizedInitialCampaignByPackageCode
    );
    setVisitDateState(stored.form?.visitDate || "");
    setAdultsState(stored.form?.adults ?? initialAdults);
    setChildrenState(stored.form?.children ?? initialChildren);
    setInfantsState(stored.form?.infants ?? initialInfants);
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
    lastInitialValuesRef.current = initialValuesSignature;
    restoringRef.current = false;

    void recoverReservationFromDraft(stored);
  }, [
    normalizedInitialPackageCode,
    normalizedInitialCampaignCode,
    normalizedInitialCampaignByPackageCode,
    initialAdults,
    initialChildren,
    initialInfants,
    initialValuesSignature,
  ]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (restoringRef.current) return;
    if (lastInitialValuesRef.current === initialValuesSignature) return;

    lastInitialValuesRef.current = initialValuesSignature;

    clearStoredDraft();
    invalidateQuoteReservationAndPayment();

    setPackageCodeState(normalizedInitialPackageCode);
    setCampaignCodeState(normalizedInitialCampaignCode);
    setCampaignByPackageCode(normalizedInitialCampaignByPackageCode);
    setVisitDateState("");
    setAdultsState(initialAdults);
    setChildrenState(initialChildren);
    setInfantsState(initialInfants);
    setInapamVisitorsState(0);
    setCouponCodeState("");
    setExtras([]);

    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCountry("");
    setComments("");
    setAcceptedTerms(false);
    setAcceptedPrivacy(false);
  }, [
    initialValuesSignature,
    normalizedInitialPackageCode,
    normalizedInitialCampaignCode,
    normalizedInitialCampaignByPackageCode,
    initialAdults,
    initialChildren,
    initialInfants,
    invalidateQuoteReservationAndPayment,
  ]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    persistDraft();
  }, [persistDraft]);

  function setPackageCode(value: string) {
    const nextPackageCode = normalizeCode(value);

    if (nextPackageCode !== packageCode) {
      invalidateQuoteReservationAndPayment();
      setPackageCodeState(nextPackageCode);

      const nextCampaignCode = campaignByPackageCode[nextPackageCode] || "";
      setCampaignCodeState(nextCampaignCode);
    }
  }

  function setCampaignCode(value: string) {
    const nextCampaignCode = normalizeCode(value);

    if (nextCampaignCode !== campaignCode) {
      invalidateQuoteReservationAndPayment();
      setCampaignCodeState(nextCampaignCode);
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
        campaignCode: campaignCode || undefined,
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
      const message = getReadableErrorMessage(error, "Error al cotizar");

      setQuoteError(message);
      showBookingError(message);

      setQuote(null);
      setQuoteSignature("");
      return null;
    } finally {
      setLoadingQuote(false);
    }
  }

  async function createDraftReservation() {
    if (!canQuote) {
      const message =
        locale === "es"
          ? "Completa paquete, fecha y al menos un visitante."
          : "Complete package, date and at least one visitor.";

      setReservationError(message);
      showBookingError(message);
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
        campaignCode: campaignCode || undefined,
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
      const message = getReadableErrorMessage(
        error,
        "Error al crear reservación"
      );

      setReservationError(message);
      showBookingError(message);

      return null;
    } finally {
      setLoadingReservation(false);
    }
  }

  async function submitContact() {
    if (!folio) {
      const message =
        locale === "es"
          ? "No se encontró el folio de la reservación"
          : "Reservation folio was not found";

      setContactError(message);
      showBookingError(message);
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
      const message =
        locale === "es"
          ? "Debes aceptar términos y políticas de privacidad"
          : "You must accept terms and privacy policy";

      setContactError(message);
      showBookingError(message);
      return null;
    }

    if (!validation.valid) {
      setContactError(validation.firstError);
      showBookingError(validation.firstError);
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
      const message = getReadableErrorMessage(
        error,
        "Error al guardar contacto"
      );

      setContactError(message);
      showBookingError(message);

      return null;
    } finally {
      setLoadingContact(false);
    }
  }

  async function generateCardPaymentIntent() {
    if (!folio) {
      const message =
        locale === "es"
          ? "No se encontró el folio para generar el pago"
          : "Reservation folio was not found";

      setPaymentError(message);
      showBookingError(message);
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
        throw new Error(
          result.message || "No se pudo iniciar el pago con tarjeta"
        );
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
      const message = getReadableErrorMessage(
        error,
        "Error al generar el pago con tarjeta"
      );

      setPaymentError(message);
      showBookingError(message);

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
      const message = getReadableErrorMessage(
        error,
        "No se pudo confirmar el pago con tarjeta"
      );

      setPaymentError(message);
      showBookingError(message);

      return null;
    } finally {
      setLoadingPayment(false);
    }
  }

  async function generateOxxoPayment() {
    if (!folio) {
      const message =
        locale === "es"
          ? "No se encontró el folio para generar el pago OXXO"
          : "Reservation folio was not found for OXXO payment";

      setPaymentError(message);
      showBookingError(message);
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
      const message = getReadableErrorMessage(
        error,
        "Error al generar pago OXXO"
      );

      setPaymentError(message);
      showBookingError(message);

      return null;
    } finally {
      setLoadingPayment(false);
    }
  }

  async function handlePrimaryAction() {
    if (currentStep === 1) {
      if (!canQuote) {
        const message =
          locale === "es"
            ? "Completa paquete, fecha y al menos un visitante."
            : "Complete package, date and at least one visitor.";

        setQuoteError(message);
        showBookingError(message);
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
        setInapamVisitorsState((prevInapam) =>
          Math.min(prevInapam, nextAdults)
        );
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

    campaignCode,
    setCampaignCode,

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
    goToStep,
  };
}
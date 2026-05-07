import {
    AdminReservationListParams,
    ApiGenericResponse,
    ApiReservationsListResponse,
    ApiSingleReservationResponse,
  } from "../types/reservation.types";
  
  function buildQueryString(params: AdminReservationListParams) {
    const searchParams = new URLSearchParams();
  
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    });
  
    return searchParams.toString();
  }
  
  async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
    });
  
    const result = await response.json();
  
    if (!response.ok) {
      throw new Error(result.message || "Error en la petición.");
    }
  
    return result as T;
  }
  
  export async function getAdminReservations(
    params: AdminReservationListParams
  ): Promise<ApiReservationsListResponse> {
    const queryString = buildQueryString(params);
  
    return requestJson<ApiReservationsListResponse>(
      `/api/admin/reservations${queryString ? `?${queryString}` : ""}`
    );
  }
  
  export async function getAdminReservationByFolio(
    folio: string
  ): Promise<ApiSingleReservationResponse> {
    return requestJson<ApiSingleReservationResponse>(
      `/api/admin/reservations/${encodeURIComponent(folio)}`
    );
  }
  
  export async function getAdminReservationLifecycle(
    folio: string
  ): Promise<ApiGenericResponse> {
    return requestJson<ApiGenericResponse>(
      `/api/admin/reservations/${encodeURIComponent(folio)}/lifecycle`
    );
  }
  
  export async function getAdminReservationEmailStatus(
    folio: string
  ): Promise<ApiGenericResponse> {
    return requestJson<ApiGenericResponse>(
      `/api/admin/reservations/${encodeURIComponent(folio)}/email-status`
    );
  }
  
  export async function confirmAdminReservationPaid(
    folio: string
  ): Promise<ApiGenericResponse> {
    return requestJson<ApiGenericResponse>(
      `/api/admin/reservations/${encodeURIComponent(folio)}/confirm-paid`,
      {
        method: "POST",
      }
    );
  }
  
  export async function resendAdminReservationEmail(
    folio: string
  ): Promise<ApiGenericResponse> {
    return requestJson<ApiGenericResponse>(
      `/api/admin/reservations/${encodeURIComponent(folio)}/resend-email`,
      {
        method: "POST",
      }
    );
  }
  
  export async function updateAdminReservationContact(
    folio: string,
    payload: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      country?: string;
      comments?: string;
    }
  ): Promise<ApiGenericResponse> {
    return requestJson<ApiGenericResponse>(
      `/api/admin/reservations/${encodeURIComponent(folio)}/contact`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }
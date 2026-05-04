import type {
    ContactApiResponse,
    ContactFormPayload,
  } from "../types/contact.types";
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  
  export async function sendContactMessage(
    payload: ContactFormPayload
  ): Promise<ContactApiResponse> {
    if (!API_BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL no está configurado");
    }
  
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    const result = await response.json().catch(() => null);
  
    if (!response.ok) {
      throw new Error(
        result?.message || result?.error || "No se pudo enviar el mensaje"
      );
    }
  
    return result;
  }
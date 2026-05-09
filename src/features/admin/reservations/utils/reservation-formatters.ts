export function formatMoneyFromCents(amount: number | null | undefined) {
    const safeAmount = Number(amount || 0);
  
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(safeAmount / 100);
  }
  
  export function formatDate(value: string | null | undefined) {
    if (!value) return "Sin fecha";
  
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) return "Fecha inválida";
  
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: "America/Cancun",
    });
  }
  
  export function formatDateTime(value: string | null | undefined) {
    if (!value) return "Sin fecha";
  
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) return "Fecha inválida";
  
    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Cancun",
    });
  }
  
  export function getCustomerName(reservation: {
    customer?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  }) {
    const firstName = reservation.customer?.firstName || "";
    const lastName = reservation.customer?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
  
    return fullName || "Cliente sin nombre";
  }
  
  export function getTotalPassengers(reservation: {
    passengers?: {
      adults?: number | null;
      children?: number | null;
      infants?: number | null;
    } | null;
  }) {
    return (
      Number(reservation.passengers?.adults || 0) +
      Number(reservation.passengers?.children || 0) +
      Number(reservation.passengers?.infants || 0)
    );
  }
  
  export function formatValue(value: unknown, fallback = "N/A") {
    if (value === null || value === undefined || value === "") return fallback;
  
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : fallback;
    }
  
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }
  
    return String(value);
  }
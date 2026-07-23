import { getAdminReservations } from "@/features/admin/reservations/services/admin-reservations.service";
import type {
  AdminReservationListParams,
  ApiReservation,
  ApiReservationsSummary,
} from "@/features/admin/reservations/types/reservation.types";

export type AdminReportFetchResult = {
  data: ApiReservation[];
  total: number;
  summary?: ApiReservationsSummary;
  truncated: boolean;
};

const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 300;

/**
 * Tope duro de registros por reporte. Con esto entra todo el histórico
 * de la página sin dejar al navegador pidiendo páginas indefinidamente.
 */
export const MAX_REPORT_RECORDS = DEFAULT_PAGE_SIZE * DEFAULT_MAX_PAGES;

/**
 * La API pagina las reservaciones, así que para un reporte por rango
 * recorremos todas las páginas y juntamos el resultado.
 *
 * maxPages evita que un rango enorme deje al navegador pidiendo páginas
 * sin fin: si se corta, avisamos con truncated.
 */
export async function fetchAllAdminReservations(
  params: AdminReservationListParams,
  options?: {
    pageSize?: number;
    maxPages?: number;
    onProgress?: (loaded: number, total: number) => void;
  }
): Promise<AdminReportFetchResult> {
  const pageSize = options?.pageSize || DEFAULT_PAGE_SIZE;
  const maxPages = options?.maxPages || DEFAULT_MAX_PAGES;

  const data: ApiReservation[] = [];

  let page = 1;
  let total = 0;
  let summary: ApiReservationsSummary | undefined;
  let truncated = false;

  while (page <= maxPages) {
    const result = await getAdminReservations({
      ...params,
      page,
      limit: pageSize,
    });

    data.push(...(result.data || []));

    total = result.pagination?.total ?? data.length;
    summary = result.summary ?? summary;

    options?.onProgress?.(data.length, total);

    if (!result.pagination?.hasNextPage) {
      break;
    }

    if (page === maxPages) {
      truncated = true;
      break;
    }

    page += 1;
  }

  return { data, total, summary, truncated };
}

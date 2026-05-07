import { getReservationStatusLabel } from "../types/reservation.types";

type ReservationStatusBadgeProps = {
  status: string | null | undefined;
};

const statusClasses: Record<string, string> = {
  DRAFT: "bg-slate-50 text-slate-700 ring-slate-200",
  PROCESSING_PAYMENT: "bg-orange-50 text-orange-700 ring-orange-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
  REFUNDED: "bg-purple-50 text-purple-700 ring-purple-200",
  COMPLETED: "bg-green-50 text-green-700 ring-green-200",
  NO_SHOW: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function ReservationStatusBadge({
  status,
}: ReservationStatusBadgeProps) {
  const safeStatus = status || "UNKNOWN";

  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1",
        statusClasses[safeStatus] ||
          "bg-slate-50 text-slate-700 ring-slate-200",
      ].join(" ")}
    >
      {getReservationStatusLabel(safeStatus)}
    </span>
  );
}
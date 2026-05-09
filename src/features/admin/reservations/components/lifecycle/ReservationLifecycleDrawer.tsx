"use client";

import { useEffect, useState } from "react";
import DrawerShell from "../common/DrawerShell";
import CompactLifecycleTree from "./CompactLifecycleTree";
import ReservationStatusBadge from "../ReservationStatusBadge";
import { getAdminReservationLifecycle } from "../../services/admin-reservations.service";
import type { ApiReservation } from "../../types/reservation.types";
import type { ReservationLifecycleResponse } from "../../types/reservation-lifecycle.types";

type ReservationLifecycleDrawerProps = {
  reservation: ApiReservation | null;
  open: boolean;
  onClose: () => void;
  detailIsOpen?: boolean;
};

export default function ReservationLifecycleDrawer({
  reservation,
  open,
  onClose,
  detailIsOpen = false,
}: ReservationLifecycleDrawerProps) {
  const [lifecycle, setLifecycle] =
    useState<ReservationLifecycleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadLifecycle = async () => {
    if (!reservation?.folio) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getAdminReservationLifecycle(reservation.folio);
      setLifecycle(result as ReservationLifecycleResponse);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el ciclo de vida."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !reservation?.folio) return;
    loadLifecycle();
  }, [open, reservation?.folio]);

  useEffect(() => {
    if (!open) {
      setLifecycle(null);
      setErrorMessage("");
      setIsLoading(false);
    }
  }, [open]);

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      eyebrow="Ciclo de vida"
      title={reservation?.folio || "Reservación"}
      subtitle="Seguimiento cronológico del flujo operativo"
      widthClassName="max-w-[54rem]"
      positionClassName={detailIsOpen ? "right-0 xl:right-[36rem]" : "right-0"}
      panelZIndexClassName="z-[50]"
      backdropZIndexClassName="z-40"
      showBackdrop={!detailIsOpen}
      headerRight={
        reservation ? (
          <div className="hidden md:flex items-center gap-2">
            <ReservationStatusBadge status={reservation.status} />
          </div>
        ) : null
      }
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={loadLifecycle}
            disabled={isLoading || !reservation}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Actualizando..." : "Actualizar ciclo"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <CompactLifecycleTree
        lifecycle={lifecycle}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </DrawerShell>
  );
}
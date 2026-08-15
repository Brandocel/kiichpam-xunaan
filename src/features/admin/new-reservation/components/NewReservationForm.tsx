"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

type PackageOption = {
  id: string;
  code: string;
  isActive: boolean;
  adultPriceMXN: number;
  childPriceMXN: number;
  infantPriceMXN: number;
  translation?: { name?: string | null } | null;
};

type SessionInfo = {
  name?: string;
  agentCode?: string | null;
  agentName?: string | null;
};

type CreatedReservation = {
  folio: string;
  totalMXN: number;
  agent?: { name: string } | null;
};

type DepositLink = {
  url: string;
  amountMXN: number;
  balanceAfterMXN: number;
};

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const EMPTY_FORM = {
  packageCode: "",
  visitDate: "",
  adults: 1,
  children: 0,
  infants: 0,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "México",
  comments: "",
};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

export default function NewReservationForm() {
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreatedReservation | null>(null);

  const [chargeAmount, setChargeAmount] = useState("");
  const [link, setLink] = useState<DepositLink | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeError, setChargeError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/packages", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        const list = Array.isArray(result?.data) ? result.data : [];
        setPackages(list.filter((item: PackageOption) => item.isActive));
      })
      .catch(() => setError("No se pudieron cargar los paquetes."));

    fetch("/api/admin/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => setSession(result?.data ?? null))
      .catch(() => undefined);
  }, []);

  const selectedPackage = useMemo(
    () => packages.find((item) => item.code === form.packageCode) ?? null,
    [packages, form.packageCode]
  );

  // Estimado local, solo de referencia: el total real lo calcula la API con
  // campañas, cupones y extras aplicados.
  const estimate = useMemo(() => {
    if (!selectedPackage) return 0;

    return (
      (form.adults * selectedPackage.adultPriceMXN +
        form.children * selectedPackage.childPriceMXN +
        form.infants * selectedPackage.infantPriceMXN) /
      100
    );
  }, [selectedPackage, form.adults, form.children, form.infants]);

  const totalPax = form.adults + form.children + form.infants;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.packageCode || !form.visitDate) {
      setError("Elige el paquete y la fecha de visita.");
      return;
    }

    if (totalPax < 1) {
      setError("Agrega al menos un visitante.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // La fecha se manda como mediodía UTC para que no se recorra de día
          // al convertir la zona horaria.
          visitDate: new Date(`${form.visitDate}T12:00:00`).toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "No se pudo crear la reservación.");
      }

      const data = result.data;

      setCreated(data);
      setChargeAmount(String(Math.round(Number(data.totalMXN) / 2)));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear la reservación."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const generateLink = async () => {
    if (!created) return;

    setIsCharging(true);
    setChargeError("");
    setLink(null);

    try {
      const response = await fetch(
        `/api/admin/reservations/${encodeURIComponent(created.folio)}/deposit-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountMXN: Number(chargeAmount) }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "No se pudo generar el link.");
      }

      setLink(result.data ?? result);
    } catch (linkError) {
      setChargeError(
        linkError instanceof Error
          ? linkError.message
          : "No se pudo generar el link."
      );
    } finally {
      setIsCharging(false);
    }
  };

  const copyLink = async () => {
    if (!link?.url) return;

    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin portapapeles: el link queda visible para copiarlo a mano.
    }
  };

  const startAnother = () => {
    setCreated(null);
    setLink(null);
    setChargeError("");
    setForm(EMPTY_FORM);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Comercial
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Nueva reservación
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Captura los datos que te dio el cliente y genera su link de pago.
        </p>

        {session?.agentCode ? (
          <p className="mt-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
            Se registrará a nombre de {session.agentName ?? session.agentCode}
          </p>
        ) : (
          <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
            Venta interna, sin agente asignado
          </p>
        )}
      </div>

      {created ? (
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500">
            Reservación creada
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            Folio {created.folio}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Total {currency.format(Number(created.totalMXN))}
            {created.agent ? ` · Agente: ${created.agent.name}` : ""}
          </p>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <p className={labelClass}>¿Cuánto vas a cobrar ahora?</p>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={10}
                step="1"
                value={chargeAmount}
                onChange={(event) => setChargeAmount(event.target.value)}
                className="h-11 w-40 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
              />

              <button
                type="button"
                onClick={() =>
                  setChargeAmount(String(Math.round(Number(created.totalMXN) / 2)))
                }
                className="h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                50% anticipo
              </button>

              <button
                type="button"
                onClick={() => setChargeAmount(String(created.totalMXN))}
                className="h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Total
              </button>

              <button
                type="button"
                onClick={generateLink}
                disabled={isCharging}
                className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isCharging ? "Generando..." : "Generar link de pago"}
              </button>
            </div>

            {chargeError && (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {chargeError}
              </div>
            )}

            {link?.url && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase text-slate-400">
                  Link por {currency.format(link.amountMXN)} · saldo después{" "}
                  {currency.format(link.balanceAfterMXN)}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-2 py-1 text-xs text-slate-600">
                    {link.url}
                  </code>

                  <button
                    type="button"
                    onClick={copyLink}
                    title="Copiar link"
                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-100"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>

                  <a
                    href={`https://wa.me/${form.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hola ${form.firstName}, aquí puedes pagar tu reservación ${created.folio}: ${link.url}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Enviar por WhatsApp al cliente"
                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-100"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={startAnother}
              className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Capturar otra reservación
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <h2 className="text-lg font-bold text-slate-950">Visita</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Paquete</label>
              <select
                value={form.packageCode}
                onChange={(event) =>
                  setForm({ ...form, packageCode: event.target.value })
                }
                required
                className={inputClass}
              >
                <option value="">Selecciona un paquete</option>
                {packages.map((item) => (
                  <option key={item.id} value={item.code}>
                    {item.translation?.name || item.code} —{" "}
                    {currency.format(item.adultPriceMXN / 100)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Fecha de visita</label>
              <input
                type="date"
                value={form.visitDate}
                onChange={(event) =>
                  setForm({ ...form, visitDate: event.target.value })
                }
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              {(
                [
                  ["adults", "Adultos"],
                  ["children", "Niños"],
                  ["infants", "Infantes"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type="number"
                    min={0}
                    value={form[key]}
                    onChange={(event) =>
                      setForm({ ...form, [key]: Number(event.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          {selectedPackage && totalPax > 0 && (
            <p className="mt-3 text-sm text-slate-500">
              Estimado: <strong>{currency.format(estimate)}</strong> para{" "}
              {totalPax} {totalPax === 1 ? "persona" : "personas"}. El total
              final lo calcula el sistema con promociones y cupones aplicados.
            </p>
          )}

          <h2 className="mt-8 text-lg font-bold text-slate-950">Cliente</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nombre</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) =>
                  setForm({ ...form, firstName: event.target.value })
                }
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Apellido</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(event) =>
                  setForm({ ...form, lastName: event.target.value })
                }
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Correo</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>País</label>
              <input
                type="text"
                value={form.country}
                onChange={(event) =>
                  setForm({ ...form, country: event.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Comentarios</label>
              <textarea
                value={form.comments}
                onChange={(event) =>
                  setForm({ ...form, comments: event.target.value })
                }
                rows={2}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isSaving ? "Creando..." : "Crear reservación"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

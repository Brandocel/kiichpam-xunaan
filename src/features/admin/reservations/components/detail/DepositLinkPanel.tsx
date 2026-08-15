"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

type Props = {
  folio: string;
  totalMXN: number;
  paidMXN: number;
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

/**
 * Genera un link de cobro por una parte del total.
 *
 * Sustituye a los Payment Links que se creaban a mano en Stripe: al pasar por
 * aquí el cobro queda amarrado al folio, aparece en Pagos y cuenta para la
 * comisión del agente.
 */
export default function DepositLinkPanel({
  folio,
  totalMXN,
  paidMXN,
}: Props) {
  const balance = Math.max(totalMXN - paidMXN, 0);

  const [amount, setAmount] = useState(() => String(Math.round(balance / 2)));
  const [link, setLink] = useState<DepositLink | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setIsLoading(true);
    setError("");
    setLink(null);

    try {
      const response = await fetch(
        `/api/admin/reservations/${encodeURIComponent(folio)}/deposit-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountMXN: Number(amount) }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "No se pudo generar el link.");
      }

      setLink(result.data ?? result);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "No se pudo generar el link."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = async () => {
    if (!link?.url) return;

    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin portapapeles: el link sigue visible para copiarlo a mano.
    }
  };

  if (balance <= 0) {
    return (
      <p className="text-sm font-medium text-emerald-700">
        Esta reservación ya está liquidada. No hay saldo por cobrar.
      </p>
    );
  }

  const whatsappHref = link?.url
    ? `https://wa.me/?text=${encodeURIComponent(
        `Puedes pagar tu reservación ${folio} aquí: ${link.url}`
      )}`
    : "";

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total</p>
          <p className="text-sm font-bold text-slate-900">
            {currency.format(totalMXN)}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-3 py-2">
          <p className="text-[11px] font-bold uppercase text-emerald-600">
            Pagado
          </p>
          <p className="text-sm font-bold text-emerald-800">
            {currency.format(paidMXN)}
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 px-3 py-2">
          <p className="text-[11px] font-bold uppercase text-amber-600">
            Saldo
          </p>
          <p className="text-sm font-bold text-amber-800">
            {currency.format(balance)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-[11px] font-bold uppercase text-slate-400">
          Cobrar ahora
          <input
            type="number"
            min={10}
            max={balance}
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 block h-10 w-36 rounded-xl border border-slate-300 px-3 text-sm font-normal text-slate-800 outline-none focus:border-slate-900"
          />
        </label>

        <button
          type="button"
          onClick={() => setAmount(String(Math.round(balance / 2)))}
          className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          50%
        </button>

        <button
          type="button"
          onClick={() => setAmount(String(balance))}
          className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Saldo total
        </button>

        <button
          type="button"
          onClick={generate}
          disabled={isLoading}
          className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {isLoading ? "Generando..." : "Generar link"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {link?.url && (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-bold uppercase text-slate-400">
            Link por {currency.format(link.amountMXN)} · saldo después{" "}
            {currency.format(link.balanceAfterMXN)}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {link.url}
            </code>

            <button
              type="button"
              onClick={copyLink}
              title="Copiar link"
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              title="Enviar por WhatsApp"
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

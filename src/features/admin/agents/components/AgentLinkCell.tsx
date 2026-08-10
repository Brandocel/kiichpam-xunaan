"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

import { buildAgentBookingLink } from "@/shared/lib/agent-attribution";

type Props = {
  code: string;
  agentName: string;
};

export default function AgentLinkCell({ code, agentName }: Props) {
  const [copied, setCopied] = useState(false);

  // El origin se resuelve en el cliente para que el link sirva igual en
  // producción, en staging y en local sin configurar nada.
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = buildAgentBookingLink(code, { baseUrl: origin });
  const displayLink = link.replace(/^https?:\/\//, "");

  const whatsappMessage = `Reserva tu visita a Cenote Kiichpam Xunáan con ${agentName}: ${link}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles (http o navegador viejo): el link sigue
      // visible en pantalla para copiarlo a mano.
    }
  };

  return (
    <div className="flex items-center gap-2">
      <code className="max-w-[260px] truncate rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
        {displayLink}
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
        title="Compartir por WhatsApp"
        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
    </div>
  );
}

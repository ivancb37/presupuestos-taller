"use client";

import { useState, useTransition } from "react";
import { responder } from "./actions";

export default function ResponderForm({ token }) {
  const [isPending, startTransition] = useTransition();
  const [pendiente, setPendiente] = useState(null);
  const [resultado, setResultado] = useState(null);

  function enviar(decision) {
    setPendiente(decision);
    startTransition(async () => {
      const r = await responder(token, decision);
      setResultado(r);
    });
  }

  if (resultado?.ok) {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium ring-1 ${
          resultado.status === "aprobado"
            ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
            : "bg-red-50 text-red-800 ring-red-100"
        }`}
      >
        <span className="text-lg">{resultado.status === "aprobado" ? "✅" : "✕"}</span>
        <span>
          {resultado.status === "aprobado"
            ? "Has aprobado este presupuesto. El taller se pondrá en contacto contigo."
            : "Has rechazado este presupuesto."}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resultado?.ok === false && (
        <p className="rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 ring-1 ring-amber-100">
          {resultado.error ||
            "Este presupuesto ya no está pendiente (puede que ya se haya respondido antes)."}
        </p>
      )}

      <button
        onClick={() => enviar("aprobado")}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-60"
      >
        {isPending && pendiente === "aprobado" ? (
          "Enviando..."
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Aprobar presupuesto
          </>
        )}
      </button>
      <button
        onClick={() => enviar("rechazado")}
        disabled={isPending}
        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-700 disabled:opacity-60"
      >
        {isPending && pendiente === "rechazado" ? "Enviando..." : "Rechazar presupuesto"}
      </button>
    </div>
  );
}

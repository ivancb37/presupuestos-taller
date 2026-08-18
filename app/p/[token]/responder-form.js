"use client";

import { useState, useTransition } from "react";
import { responder } from "./actions";

export default function ResponderForm({ token }) {
  const [isPending, startTransition] = useTransition();
  const [resultado, setResultado] = useState(null);

  function enviar(decision) {
    startTransition(async () => {
      const r = await responder(token, decision);
      setResultado(r);
    });
  }

  if (resultado?.ok) {
    return (
      <p
        className={`rounded-md px-4 py-3 text-center text-sm font-medium ${
          resultado.status === "aprobado"
            ? "bg-green-50 text-green-800"
            : "bg-red-50 text-red-800"
        }`}
      >
        {resultado.status === "aprobado"
          ? "✅ Has aprobado este presupuesto. El taller se pondrá en contacto contigo."
          : "Has rechazado este presupuesto."}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {resultado?.ok === false && (
        <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          {resultado.error ||
            "Este presupuesto ya no está pendiente (puede que ya se haya respondido antes)."}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => enviar("rechazado")}
          disabled={isPending}
          className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Rechazar
        </button>
        <button
          onClick={() => enviar("aprobado")}
          disabled={isPending}
          className="flex-1 rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? "Enviando..." : "Aprobar presupuesto"}
        </button>
      </div>
    </div>
  );
}

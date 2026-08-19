"use client";

import { useTransition } from "react";
import { marcarTerminado } from "./actions";

export default function MarcarTerminado({ id, terminado }) {
  const [isPending, startTransition] = useTransition();

  function alternar() {
    startTransition(async () => {
      await marcarTerminado(id, !terminado);
    });
  }

  if (terminado) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Trabajo terminado
        </p>
        <button
          type="button"
          onClick={alternar}
          disabled={isPending}
          className="text-sm font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-900 disabled:opacity-50"
        >
          Deshacer
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={isPending}
      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
    >
      {isPending ? "Guardando..." : "Marcar trabajo como terminado"}
    </button>
  );
}

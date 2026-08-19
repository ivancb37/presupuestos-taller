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
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <p className="text-sm font-medium text-green-800">✅ Trabajo terminado</p>
        <button
          type="button"
          onClick={alternar}
          disabled={isPending}
          className="text-sm text-green-700 underline hover:text-green-900 disabled:opacity-50"
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
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {isPending ? "Guardando..." : "Marcar trabajo como terminado"}
    </button>
  );
}

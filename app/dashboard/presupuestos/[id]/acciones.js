"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { eliminarPresupuesto } from "./actions";

export default function AccionesPresupuesto({ id }) {
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleEliminar() {
    if (
      !confirm(
        "¿Seguro que quieres eliminar este presupuesto? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    startTransition(async () => {
      const resultado = await eliminarPresupuesto(id);
      if (resultado?.error) {
        setError(resultado.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Link
          href={`/dashboard/presupuestos/${id}/editar`}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={handleEliminar}
          disabled={isPending}
          className="flex-1 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          {isPending ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
}

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
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="flex gap-4 text-sm">
        <Link
          href={`/dashboard/presupuestos/${id}/editar`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={handleEliminar}
          disabled={isPending}
          className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {isPending ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
}

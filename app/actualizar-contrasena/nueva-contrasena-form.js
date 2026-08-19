"use client";

import { useState, useTransition } from "react";
import { actualizarContrasena } from "./actions";

export default function NuevaContrasenaForm() {
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    setError(null);
    startTransition(async () => {
      const r = await actualizarContrasena(formData);
      if (r?.error) setError(r.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <input
        name="password"
        type="password"
        placeholder="Contraseña nueva (mín. 6 caracteres)"
        required
        minLength={6}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar contraseña"}
      </button>
    </form>
  );
}

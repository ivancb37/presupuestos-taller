"use client";

import { useState, useTransition } from "react";
import { actualizarContrasena } from "./actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15";

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
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}
      <input
        name="password"
        type="password"
        placeholder="Contraseña nueva (mín. 6 caracteres)"
        required
        minLength={6}
        className={inputClass}
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar contraseña"}
      </button>
    </form>
  );
}

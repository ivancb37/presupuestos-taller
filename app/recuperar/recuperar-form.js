"use client";

import { useState, useTransition } from "react";
import { solicitarRecuperacion } from "./actions";

export default function RecuperarForm() {
  const [resultado, setResultado] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    startTransition(async () => {
      const r = await solicitarRecuperacion(formData);
      setResultado(r);
    });
  }

  if (resultado?.ok) {
    return (
      <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
        {resultado.mensaje}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {resultado?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {resultado.error}
        </p>
      )}
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
      </button>
    </form>
  );
}

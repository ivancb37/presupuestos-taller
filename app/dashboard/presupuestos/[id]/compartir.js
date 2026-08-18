"use client";

import { useState } from "react";

function soloDigitos(telefono) {
  return (telefono || "").replace(/[^\d]/g, "");
}

export default function Compartir({ url, clienteNombre, clienteTelefono }) {
  const [copiado, setCopiado] = useState(false);

  const mensaje = `Hola ${clienteNombre}, aquí tienes el presupuesto de tu vehículo: ${url}`;
  const numero = soloDigitos(clienteTelefono);
  // Si hay teléfono, wa.me/<numero> abre el chat directo con ese contacto;
  // si no, wa.me sin número deja elegir el contacto dentro de WhatsApp.
  const enlaceWhatsapp = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="space-y-3">
      <p className="break-all rounded-md bg-white px-3 py-2 font-mono text-xs text-gray-700">
        {url}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={enlaceWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-md bg-green-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-700"
        >
          Enviar por WhatsApp
        </a>
        <button
          type="button"
          onClick={copiar}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {copiado ? "¡Copiado!" : "Copiar enlace"}
        </button>
      </div>
    </div>
  );
}

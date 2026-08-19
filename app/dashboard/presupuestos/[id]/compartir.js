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
      <p className="break-all rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-600">
        {url}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={enlaceWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-500"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.87.507 3.62 1.393 5.126L2 22l4.996-1.362A9.95 9.95 0 0012 22c5.523 0 10-4.477 10-10S17.524 2 12.001 2zm0 18.163a8.13 8.13 0 01-4.148-1.135l-.297-.176-3.096.844.827-3.02-.194-.31A8.13 8.13 0 013.837 12c0-4.5 3.663-8.163 8.164-8.163 4.5 0 8.163 3.663 8.163 8.163 0 4.501-3.663 8.163-8.163 8.163z" />
          </svg>
          Enviar por WhatsApp
        </a>
        <button
          type="button"
          onClick={copiar}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          {copiado ? "¡Copiado!" : "Copiar enlace"}
        </button>
      </div>
    </div>
  );
}

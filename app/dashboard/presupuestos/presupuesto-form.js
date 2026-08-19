"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";

const conceptoVacio = () => ({ descripcion: "", cantidad: "1", precio_unitario: "" });

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const cardClass = "space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60";

function euros(numero) {
  return numero.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

// Formulario compartido entre "crear presupuesto nuevo" y "editar uno
// existente". `accion` es la Server Action a llamar al guardar (recibe el
// objeto con los datos del formulario); `valoresIniciales` precarga los
// campos cuando se usa para editar.
export default function PresupuestoForm({ accion, valoresIniciales, textoBoton = "Guardar presupuesto" }) {
  const [cliente, setCliente] = useState({
    cliente_nombre: valoresIniciales?.cliente_nombre || "",
    cliente_telefono: valoresIniciales?.cliente_telefono || "",
    vehiculo_marca: valoresIniciales?.vehiculo_marca || "",
    vehiculo_modelo: valoresIniciales?.vehiculo_modelo || "",
    vehiculo_matricula: valoresIniciales?.vehiculo_matricula || "",
    notas: valoresIniciales?.notas || "",
  });
  const [items, setItems] = useState(
    valoresIniciales?.items?.length
      ? valoresIniciales.items.map((i) => ({
          descripcion: i.descripcion,
          cantidad: String(i.cantidad),
          precio_unitario: String(i.precio_unitario),
        }))
      : [conceptoVacio()]
  );
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(valoresIniciales?.foto_url || null);
  const [fotoEliminada, setFotoEliminada] = useState(false);
  const [error, setError] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [isPending, startTransition] = useTransition();

  const total = items.reduce(
    (suma, item) => suma + (Number(item.cantidad) || 0) * (Number(item.precio_unitario) || 0),
    0
  );

  function actualizarCliente(campo, valor) {
    setCliente((prev) => ({ ...prev, [campo]: valor }));
  }

  function actualizarItem(index, campo, valor) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item))
    );
  }

  function añadirConcepto() {
    setItems((prev) => [...prev, conceptoVacio()]);
  }

  function quitarConcepto(index) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function elegirFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoEliminada(false);
    setFotoPreview((prevUrl) => {
      if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
      return URL.createObjectURL(file);
    });
  }

  function quitarFoto() {
    setFotoPreview((prevUrl) => {
      if (prevUrl && prevUrl.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
      return null;
    });
    setFoto(null);
    setFotoEliminada(true);
  }

  async function subirFoto(supabase, userId) {
    const extension = foto.name.split(".").pop();
    const ruta = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("vehiculo-fotos")
      .upload(ruta, foto);

    if (uploadError) {
      throw new Error(`No se pudo subir la foto: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("vehiculo-fotos").getPublicUrl(ruta);
    return data.publicUrl;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      // foto_url: string nueva si se subió una foto distinta, null si se
      // quitó explícitamente, undefined si no se tocó (mantener la actual).
      let foto_url = fotoEliminada ? null : undefined;

      if (foto) {
        setSubiendoFoto(true);
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            setError("Tu sesión ha caducado, vuelve a iniciar sesión.");
            setSubiendoFoto(false);
            return;
          }
          foto_url = await subirFoto(supabase, user.id);
        } catch (err) {
          setError(err.message);
          setSubiendoFoto(false);
          return;
        }
        setSubiendoFoto(false);
      }

      const resultado = await accion({ ...cliente, items, foto_url });
      if (resultado?.error) {
        setError(resultado.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}

      <section className={cardClass}>
        <h2 className="font-display font-semibold text-slate-900">Cliente y vehículo</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre del cliente *</label>
            <input
              required
              value={cliente.cliente_nombre}
              onChange={(e) => actualizarCliente("cliente_nombre", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Teléfono (para WhatsApp)</label>
            <input
              type="tel"
              placeholder="+34 600 000 000"
              value={cliente.cliente_telefono}
              onChange={(e) => actualizarCliente("cliente_telefono", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Marca</label>
            <input
              value={cliente.vehiculo_marca}
              onChange={(e) => actualizarCliente("vehiculo_marca", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Modelo</label>
            <input
              value={cliente.vehiculo_modelo}
              onChange={(e) => actualizarCliente("vehiculo_modelo", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Matrícula</label>
            <input
              value={cliente.vehiculo_matricula}
              onChange={(e) => actualizarCliente("vehiculo_matricula", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="font-display font-semibold text-slate-900">Conceptos</h2>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-[1fr_5rem_7rem_auto] sm:items-end sm:border-0 sm:bg-transparent sm:p-0"
            >
              <div>
                <label className="mb-1 block text-xs text-slate-500 sm:hidden">
                  Descripción
                </label>
                <input
                  required
                  placeholder="Ej. Pastillas de freno delanteras"
                  value={item.descripcion}
                  onChange={(e) => actualizarItem(index, "descripcion", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500 sm:hidden">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(index, "cantidad", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500 sm:hidden">
                  Precio/ud (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={item.precio_unitario}
                  onChange={(e) =>
                    actualizarItem(index, "precio_unitario", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => quitarConcepto(index)}
                disabled={items.length === 1}
                aria-label="Quitar concepto"
                className="justify-self-start rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-0 sm:justify-self-center"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={añadirConcepto}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir concepto
        </button>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-medium text-slate-500">Total</span>
          <span className="font-display text-xl font-semibold text-slate-900">{euros(total)}</span>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="font-display font-semibold text-slate-900">Foto del vehículo (opcional)</h2>

        {fotoPreview ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoPreview}
              alt="Vista previa del vehículo"
              className="max-h-48 w-full rounded-lg border border-slate-200 object-cover"
            />
            <button
              type="button"
              onClick={quitarFoto}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Quitar foto
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40">
            <svg
              className="h-7 w-7 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75 7.5 8.25M12 3.75v13.5"
              />
            </svg>
            <span className="text-sm text-slate-500">
              <span className="font-semibold text-indigo-600">Sube una foto</span> del vehículo
            </span>
            <input type="file" accept="image/*" onChange={elegirFoto} className="hidden" />
          </label>
        )}
      </section>

      <section className={cardClass}>
        <label className={labelClass}>Notas (opcional)</label>
        <textarea
          rows={3}
          value={cliente.notas}
          onChange={(e) => actualizarCliente("notas", e.target.value)}
          placeholder="Ej. Se recomienda revisar también la correa de distribución"
          className={inputClass}
        />
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50"
      >
        {subiendoFoto ? "Subiendo foto..." : isPending ? "Guardando..." : textoBoton}
      </button>
    </form>
  );
}

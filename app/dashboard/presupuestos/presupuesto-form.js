"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";

const conceptoVacio = () => ({ descripcion: "", cantidad: "1", precio_unitario: "" });

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Cliente y vehículo</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-700">
              Nombre del cliente *
            </label>
            <input
              required
              value={cliente.cliente_nombre}
              onChange={(e) => actualizarCliente("cliente_nombre", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">
              Teléfono (para WhatsApp)
            </label>
            <input
              type="tel"
              placeholder="+34 600 000 000"
              value={cliente.cliente_telefono}
              onChange={(e) => actualizarCliente("cliente_telefono", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Marca</label>
            <input
              value={cliente.vehiculo_marca}
              onChange={(e) => actualizarCliente("vehiculo_marca", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Modelo</label>
            <input
              value={cliente.vehiculo_modelo}
              onChange={(e) => actualizarCliente("vehiculo_modelo", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Matrícula</label>
            <input
              value={cliente.vehiculo_matricula}
              onChange={(e) => actualizarCliente("vehiculo_matricula", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Conceptos</h2>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-2 rounded-md border border-gray-100 p-3 sm:grid-cols-[1fr_5rem_7rem_auto] sm:items-end sm:border-0 sm:p-0"
            >
              <div>
                <label className="mb-1 block text-xs text-gray-500 sm:hidden">
                  Descripción
                </label>
                <input
                  required
                  placeholder="Ej. Pastillas de freno delanteras"
                  value={item.descripcion}
                  onChange={(e) => actualizarItem(index, "descripcion", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500 sm:hidden">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(index, "cantidad", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500 sm:hidden">
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => quitarConcepto(index)}
                disabled={items.length === 1}
                className="justify-self-start text-sm text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-300 sm:justify-self-center"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={añadirConcepto}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          + Añadir concepto
        </button>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-lg font-bold text-gray-900">{euros(total)}</span>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Foto del vehículo (opcional)</h2>

        {fotoPreview ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoPreview}
              alt="Vista previa del vehículo"
              className="max-h-48 w-full rounded-md border border-gray-200 object-cover"
            />
            <button
              type="button"
              onClick={quitarFoto}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Quitar foto
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={elegirFoto}
            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
        )}
      </section>

      <section className="space-y-2 rounded-lg border border-gray-200 bg-white p-5">
        <label className="block text-sm text-gray-700">Notas (opcional)</label>
        <textarea
          rows={3}
          value={cliente.notas}
          onChange={(e) => actualizarCliente("notas", e.target.value)}
          placeholder="Ej. Se recomienda revisar también la correa de distribución"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {subiendoFoto ? "Subiendo foto..." : isPending ? "Guardando..." : textoBoton}
      </button>
    </form>
  );
}

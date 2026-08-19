"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// Extrae la ruta dentro del bucket a partir de la URL pública, para poder
// borrar el archivo viejo de Storage cuando se sustituye o se quita la foto.
// Ej: ".../storage/v1/object/public/vehiculo-fotos/abc/def.jpg" -> "abc/def.jpg"
function rutaDesdeUrlPublica(url) {
  const marcador = "/vehiculo-fotos/";
  const i = url?.indexOf(marcador);
  return i === -1 || i === undefined ? null : url.slice(i + marcador.length);
}

export async function actualizarPresupuesto(id, datos) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!datos.cliente_nombre?.trim()) {
    return { error: "El nombre del cliente es obligatorio." };
  }

  const items = (datos.items || [])
    .filter((item) => item.descripcion?.trim() && item.precio_unitario !== "")
    .map((item, index) => ({
      descripcion: item.descripcion.trim(),
      cantidad: Number(item.cantidad) || 1,
      precio_unitario: Number(item.precio_unitario),
      orden: index,
    }));

  if (items.length === 0) {
    return { error: "Añade al menos un concepto con descripción y precio." };
  }

  // Se puede editar en cualquier estado (p. ej. corregir un teléfono o una
  // matrícula mal escritos incluso después de que el cliente ya respondió).
  // Ojo: si cambias los conceptos/precios de un presupuesto ya aprobado, el
  // cliente NO vuelve a ver ni a confirmar esos cambios automáticamente.
  const { data: actual } = await supabase
    .from("budgets")
    .select("status, foto_url")
    .eq("id", id)
    .eq("mechanic_id", user.id)
    .single();

  if (!actual) {
    return { error: "Presupuesto no encontrado." };
  }

  const cambios = {
    cliente_nombre: datos.cliente_nombre.trim(),
    cliente_telefono: datos.cliente_telefono?.trim() || null,
    vehiculo_marca: datos.vehiculo_marca?.trim() || null,
    vehiculo_modelo: datos.vehiculo_modelo?.trim() || null,
    vehiculo_matricula: datos.vehiculo_matricula?.trim() || null,
    notas: datos.notas?.trim() || null,
  };

  // foto_url === undefined significa "no se tocó, deja la que había".
  if (datos.foto_url !== undefined) {
    cambios.foto_url = datos.foto_url;
  }

  const { error: budgetError } = await supabase
    .from("budgets")
    .update(cambios)
    .eq("id", id)
    .eq("mechanic_id", user.id);

  if (budgetError) {
    return { error: budgetError.message };
  }

  // Si se sustituyó o quitó la foto, borramos el archivo antiguo de Storage
  // para no dejar basura acumulándose (no bloqueamos el guardado si falla).
  if (datos.foto_url !== undefined && actual.foto_url && actual.foto_url !== datos.foto_url) {
    const rutaVieja = rutaDesdeUrlPublica(actual.foto_url);
    if (rutaVieja) {
      await supabase.storage.from("vehiculo-fotos").remove([rutaVieja]);
    }
  }

  // Reemplazamos los conceptos enteros en vez de intentar calcular un diff
  // fila a fila: es más simple y aquí no hay mucho volumen de datos.
  const { error: deleteError } = await supabase
    .from("budget_items")
    .delete()
    .eq("budget_id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  const { error: itemsError } = await supabase
    .from("budget_items")
    .insert(items.map((item) => ({ ...item, budget_id: id })));

  if (itemsError) {
    return { error: itemsError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/presupuestos/${id}`);
  redirect(`/dashboard/presupuestos/${id}`);
}

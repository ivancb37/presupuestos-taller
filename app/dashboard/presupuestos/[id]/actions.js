"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

function rutaDesdeUrlPublica(url) {
  const marcador = "/vehiculo-fotos/";
  const i = url?.indexOf(marcador);
  return i === -1 || i === undefined ? null : url.slice(i + marcador.length);
}

export async function eliminarPresupuesto(id) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: budget } = await supabase
    .from("budgets")
    .select("foto_url")
    .eq("id", id)
    .eq("mechanic_id", user.id)
    .single();

  if (!budget) {
    return { error: "Presupuesto no encontrado." };
  }

  // budget_items se borra solo por el "on delete cascade" de la tabla.
  // Pedimos .select() para saber cuántas filas se borraron de verdad: si
  // falta una política RLS de DELETE, Supabase no da error pero tampoco
  // borra nada — sin este chequeo, ese fallo pasaría desapercibido.
  const { data: borrados, error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("mechanic_id", user.id)
    .select("id");

  if (error) {
    return { error: error.message };
  }

  if (!borrados || borrados.length === 0) {
    return {
      error: "No se pudo eliminar (0 filas afectadas). Revisa los permisos en Supabase.",
    };
  }

  if (budget.foto_url) {
    const ruta = rutaDesdeUrlPublica(budget.foto_url);
    if (ruta) {
      await supabase.storage.from("vehiculo-fotos").remove([ruta]);
    }
  }

  // Sin esto, /dashboard puede servirse desde la caché del navegador (Router
  // Cache de Next.js) y seguir mostrando el presupuesto que acabamos de
  // borrar hasta que esa caché expire por su cuenta.
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function marcarTerminado(id, terminado) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("budgets")
    .update({ trabajo_terminado: terminado })
    .eq("id", id)
    .eq("mechanic_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/presupuestos/${id}`);
  return { ok: true };
}

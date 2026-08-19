"use server";

import { redirect } from "next/navigation";
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
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("mechanic_id", user.id);

  if (error) {
    return { error: error.message };
  }

  if (budget.foto_url) {
    const ruta = rutaDesdeUrlPublica(budget.foto_url);
    if (ruta) {
      await supabase.storage.from("vehiculo-fotos").remove([ruta]);
    }
  }

  redirect("/dashboard");
}

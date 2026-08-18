"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// A diferencia de login/signup (que se llaman como formAction={..} desde un
// <button> dentro de un <form>), esta Server Action la llamamos directamente
// como una función normal desde el componente cliente del formulario,
// pasándole un objeto JS (no un FormData) — Next.js serializa la llamada
// por nosotros. Esto nos permite mandar un array de conceptos sin líos.
export async function crearPresupuesto(datos) {
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

  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .insert({
      mechanic_id: user.id,
      cliente_nombre: datos.cliente_nombre.trim(),
      cliente_telefono: datos.cliente_telefono?.trim() || null,
      vehiculo_marca: datos.vehiculo_marca?.trim() || null,
      vehiculo_modelo: datos.vehiculo_modelo?.trim() || null,
      vehiculo_matricula: datos.vehiculo_matricula?.trim() || null,
      notas: datos.notas?.trim() || null,
    })
    .select("id")
    .single();

  if (budgetError) {
    return { error: budgetError.message };
  }

  const { error: itemsError } = await supabase
    .from("budget_items")
    .insert(items.map((item) => ({ ...item, budget_id: budget.id })));

  if (itemsError) {
    // El presupuesto ya se creó pero sin conceptos: lo borramos para no
    // dejar un presupuesto "vacío" a medio guardar en la base de datos.
    await supabase.from("budgets").delete().eq("id", budget.id);
    return { error: itemsError.message };
  }

  redirect(`/dashboard/presupuestos/${budget.id}`);
}

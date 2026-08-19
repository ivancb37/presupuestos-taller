import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import PresupuestoForm from "../../presupuesto-form";
import { actualizarPresupuesto } from "./actions";

export default async function EditarPresupuestoPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: budget } = await supabase
    .from("budgets")
    .select("*, budget_items(*)")
    .eq("id", id)
    .order("orden", { referencedTable: "budget_items" })
    .single();

  if (!budget) {
    notFound();
  }

  // Al usar bind, el primer argumento (id) queda fijado; el formulario solo
  // tiene que pasar los datos, igual que hace con crearPresupuesto.
  const accion = actualizarPresupuesto.bind(null, id);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Editar presupuesto</h1>

      {budget.status !== "pendiente" && (
        <p className="rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 ring-1 ring-amber-100">
          El cliente ya {budget.status === "aprobado" ? "aprobó" : "rechazó"} este
          presupuesto. Puedes corregir datos como el teléfono o la matrícula, pero
          si cambias los conceptos o precios, el cliente no lo verá reflejado
          automáticamente en su decisión ya tomada.
        </p>
      )}

      <PresupuestoForm
        accion={accion}
        valoresIniciales={{ ...budget, items: budget.budget_items }}
        textoBoton="Guardar cambios"
      />
    </div>
  );
}

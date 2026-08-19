import { notFound, redirect } from "next/navigation";
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

  // Ya no se puede editar un presupuesto una vez que el cliente respondió.
  if (budget.status !== "pendiente") {
    redirect(`/dashboard/presupuestos/${id}`);
  }

  // Al usar bind, el primer argumento (id) queda fijado; el formulario solo
  // tiene que pasar los datos, igual que hace con crearPresupuesto.
  const accion = actualizarPresupuesto.bind(null, id);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Editar presupuesto</h1>
      <PresupuestoForm
        accion={accion}
        valoresIniciales={{ ...budget, items: budget.budget_items }}
        textoBoton="Guardar cambios"
      />
    </div>
  );
}

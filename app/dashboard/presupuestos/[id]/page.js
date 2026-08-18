import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function euros(numero) {
  return Number(numero).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export default async function DetallePresupuestoPage({ params }) {
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

  const total = budget.budget_items.reduce(
    (suma, item) => suma + item.cantidad * item.precio_unitario,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{budget.cliente_nombre}</h1>
        <p className="text-sm text-gray-500">
          {[budget.vehiculo_marca, budget.vehiculo_modelo, budget.vehiculo_matricula]
            .filter(Boolean)
            .join(" · ") || "Sin datos de vehículo"}
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-2 font-medium">Concepto</th>
              <th className="pb-2 font-medium">Cant.</th>
              <th className="pb-2 text-right font-medium">Precio/ud</th>
              <th className="pb-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {budget.budget_items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2 text-gray-900">{item.descripcion}</td>
                <td className="py-2 text-gray-500">{item.cantidad}</td>
                <td className="py-2 text-right text-gray-500">
                  {euros(item.precio_unitario)}
                </td>
                <td className="py-2 text-right text-gray-900">
                  {euros(item.cantidad * item.precio_unitario)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="font-medium text-gray-500">Total</span>
          <span className="text-lg font-bold text-gray-900">{euros(total)}</span>
        </div>
      </section>

      {budget.notas && (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-medium text-gray-500">Notas</h2>
          <p className="text-sm text-gray-900">{budget.notas}</p>
        </section>
      )}

      <section className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500">
        <p className="font-medium text-gray-700">Enlace público para el cliente</p>
        <p className="mt-1 break-all font-mono text-xs">
          /p/{budget.public_token}
        </p>
        <p className="mt-2">
          🔜 Todavía no existe esa pantalla — la construimos en el siguiente paso.
        </p>
      </section>
    </div>
  );
}

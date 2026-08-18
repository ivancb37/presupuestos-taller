import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Compartir from "./compartir";

function euros(numero) {
  return Number(numero).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function colorEstado(status) {
  if (status === "aprobado") return "bg-green-100 text-green-800";
  if (status === "rechazado") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
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

  const headerList = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `${headerList.get("x-forwarded-proto") || "http"}://${headerList.get("host")}`;
  const urlPublica = `${origin}/p/${budget.public_token}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{budget.cliente_nombre}</h1>
          <p className="text-sm text-gray-500">
            {[budget.vehiculo_marca, budget.vehiculo_modelo, budget.vehiculo_matricula]
              .filter(Boolean)
              .join(" · ") || "Sin datos de vehículo"}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${colorEstado(budget.status)}`}
        >
          {budget.status}
        </span>
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

      <section className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <p className="mb-2 text-sm font-medium text-gray-700">
          Enlace público para el cliente
        </p>
        <Compartir
          url={urlPublica}
          clienteNombre={budget.cliente_nombre}
          clienteTelefono={budget.cliente_telefono}
        />
      </section>
    </div>
  );
}

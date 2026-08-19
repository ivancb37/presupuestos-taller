import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Compartir from "./compartir";
import AccionesPresupuesto from "./acciones";
import MarcarTerminado from "./marcar-terminado";

function euros(numero) {
  return Number(numero).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function estiloEstado(status, terminado) {
  if (status === "aprobado" && terminado) return "bg-slate-200 text-slate-700";
  if (status === "aprobado") return "bg-emerald-100 text-emerald-700";
  if (status === "rechazado") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-800";
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">
            {budget.cliente_nombre}
          </h1>
          <p className="text-sm text-slate-500">
            {[budget.vehiculo_marca, budget.vehiculo_modelo, budget.vehiculo_matricula]
              .filter(Boolean)
              .join(" · ") || "Sin datos de vehículo"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${estiloEstado(budget.status, budget.trabajo_terminado)}`}
        >
          {budget.status === "aprobado" && budget.trabajo_terminado
            ? "terminado"
            : budget.status}
        </span>
      </div>

      {budget.status === "aprobado" && (
        <MarcarTerminado id={budget.id} terminado={budget.trabajo_terminado} />
      )}

      {budget.foto_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={budget.foto_url}
          alt="Foto del vehículo"
          className="max-h-64 w-full rounded-xl border border-slate-200 object-cover shadow-sm"
        />
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="pb-2 font-medium">Concepto</th>
              <th className="pb-2 font-medium">Cant.</th>
              <th className="pb-2 text-right font-medium">Precio/ud</th>
              <th className="pb-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {budget.budget_items.map((item) => (
              <tr key={item.id} className="border-b border-slate-50 last:border-0">
                <td className="py-2.5 text-slate-900">{item.descripcion}</td>
                <td className="py-2.5 text-slate-500">{item.cantidad}</td>
                <td className="py-2.5 text-right text-slate-500">
                  {euros(item.precio_unitario)}
                </td>
                <td className="py-2.5 text-right font-medium text-slate-900">
                  {euros(item.cantidad * item.precio_unitario)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-medium text-slate-500">Total</span>
          <span className="font-display text-xl font-semibold text-slate-900">{euros(total)}</span>
        </div>
      </section>

      {budget.notas && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <h2 className="mb-1 text-sm font-medium text-slate-500">Notas</h2>
          <p className="text-sm text-slate-900">{budget.notas}</p>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="mb-2 text-sm font-medium text-slate-700">
          Enlace público para el cliente
        </p>
        <Compartir
          url={urlPublica}
          clienteNombre={budget.cliente_nombre}
          clienteTelefono={budget.cliente_telefono}
        />
      </section>

      <AccionesPresupuesto id={budget.id} />
    </div>
  );
}

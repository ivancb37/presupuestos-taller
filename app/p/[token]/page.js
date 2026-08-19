import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ResponderForm from "./responder-form";

function euros(numero) {
  return Number(numero).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function fecha(iso) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PresupuestoPublicoPage({ params }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: budget, error } = await supabase.rpc("get_public_budget", {
    p_token: token,
  });

  // La función devuelve null si el token no existe: no filtramos más para
  // no dar pistas de si un token "casi válido" existe o no.
  if (error || !budget || !budget.cliente_nombre) {
    notFound();
  }

  const total = budget.items.reduce(
    (suma, item) => suma + item.cantidad * item.precio_unitario,
    0
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 pb-14 pt-8">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2 px-4 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg">
            🔧
          </span>
          <p className="text-sm font-medium text-slate-300">{budget.nombre_taller}</p>
          <h1 className="font-display text-xl font-semibold text-white">
            Presupuesto para {budget.cliente_nombre}
          </h1>
          <p className="text-sm text-slate-400">
            {[budget.vehiculo_marca, budget.vehiculo_modelo, budget.vehiculo_matricula]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-8 max-w-md space-y-5 px-4 pb-10">
        {budget.foto_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={budget.foto_url}
            alt="Foto del vehículo"
            className="w-full rounded-xl border border-white object-cover shadow-lg shadow-slate-900/10"
          />
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
          <ul className="divide-y divide-slate-100 px-4">
            {budget.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="text-slate-900">{item.descripcion}</p>
                  <p className="text-slate-500">
                    {item.cantidad} × {euros(item.precio_unitario)}
                  </p>
                </div>
                <p className="shrink-0 font-medium text-slate-900">
                  {euros(item.cantidad * item.precio_unitario)}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between bg-slate-900 px-4 py-4">
            <span className="text-sm font-medium text-slate-300">Total</span>
            <span className="font-display text-2xl font-semibold text-white">{euros(total)}</span>
          </div>
        </section>

        {budget.notas && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
            <h2 className="mb-1 text-sm font-medium text-slate-500">Notas del taller</h2>
            <p className="text-sm text-slate-900">{budget.notas}</p>
          </section>
        )}

        {budget.status === "pendiente" ? (
          <ResponderForm token={token} />
        ) : (
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium ring-1 ${
              budget.status === "aprobado"
                ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                : "bg-red-50 text-red-800 ring-red-100"
            }`}
          >
            <span className="text-lg">{budget.status === "aprobado" ? "✅" : "✕"}</span>
            <span>
              {budget.status === "aprobado"
                ? `Aprobado el ${fecha(budget.decided_at)}.`
                : `Rechazado el ${fecha(budget.decided_at)}.`}
            </span>
          </div>
        )}

        <p className="pt-2 text-center text-xs text-slate-400">
          Presupuesto generado con Presupuestos de Taller
        </p>
      </div>
    </main>
  );
}

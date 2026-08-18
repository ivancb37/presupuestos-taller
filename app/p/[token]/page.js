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
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-md space-y-5">
        <div className="text-center">
          <p className="text-sm text-gray-500">{budget.nombre_taller}</p>
          <h1 className="text-lg font-bold text-gray-900">
            Presupuesto para {budget.cliente_nombre}
          </h1>
          <p className="text-sm text-gray-500">
            {[budget.vehiculo_marca, budget.vehiculo_modelo, budget.vehiculo_matricula]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {budget.foto_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={budget.foto_url}
            alt="Foto del vehículo"
            className="w-full rounded-lg border border-gray-200 object-cover"
          />
        )}

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <ul className="divide-y divide-gray-100">
            {budget.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="text-gray-900">{item.descripcion}</p>
                  <p className="text-gray-500">
                    {item.cantidad} × {euros(item.precio_unitario)}
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  {euros(item.cantidad * item.precio_unitario)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="font-medium text-gray-500">Total</span>
            <span className="text-xl font-bold text-gray-900">{euros(total)}</span>
          </div>
        </section>

        {budget.notas && (
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-1 text-sm font-medium text-gray-500">Notas del taller</h2>
            <p className="text-sm text-gray-900">{budget.notas}</p>
          </section>
        )}

        {budget.status === "pendiente" ? (
          <ResponderForm token={token} />
        ) : (
          <p
            className={`rounded-md px-4 py-3 text-center text-sm font-medium ${
              budget.status === "aprobado"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {budget.status === "aprobado"
              ? `✅ Aprobado el ${fecha(budget.decided_at)}.`
              : `Rechazado el ${fecha(budget.decided_at)}.`}
          </p>
        )}
      </div>
    </main>
  );
}

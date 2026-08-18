import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

function colorEstado(status) {
  if (status === "aprobado") return "bg-green-100 text-green-800";
  if (status === "rechazado") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gracias a la política RLS "budgets: mechanic select own", esta consulta
  // ya solo puede devolver presupuestos de este mecánico aunque no filtrásemos
  // por mechanic_id — pero lo hacemos explícito igualmente por claridad.
  const { data: budgets } = await supabase
    .from("budgets")
    .select("id, cliente_nombre, vehiculo_marca, vehiculo_modelo, status, created_at")
    .eq("mechanic_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Presupuestos</h1>
        <Link
          href="/dashboard/presupuestos/nuevo"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nuevo presupuesto
        </Link>
      </div>

      {budgets?.length ? (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {budgets.map((b) => (
            <li key={b.id}>
              <Link
                href={`/dashboard/presupuestos/${b.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{b.cliente_nombre}</p>
                  <p className="text-sm text-gray-500">
                    {[b.vehiculo_marca, b.vehiculo_modelo].filter(Boolean).join(" ") ||
                      "Sin datos de vehículo"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${colorEstado(b.status)}`}
                >
                  {b.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
          Todavía no has creado ningún presupuesto.
        </p>
      )}
    </div>
  );
}

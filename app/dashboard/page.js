import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function colorEstado(status) {
  if (status === "aprobado") return "bg-green-100 text-green-800";
  if (status === "rechazado") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}

function FilaPresupuesto({ b }) {
  return (
    <li>
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
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${colorEstado(b.status)}`}>
          {b.status === "aprobado" && b.trabajo_terminado ? "terminado" : b.status}
        </span>
      </Link>
    </li>
  );
}

// Bloque desplegable con contador. `abierto` controla si empieza expandido
// (usamos el atributo nativo <details>/<summary> del navegador: no hace
// falta JavaScript ni componente cliente para que se pueda plegar/desplegar).
function Bloque({ titulo, color, presupuestos, abierto, vacio }) {
  return (
    <details open={abierto} className="group rounded-lg border border-gray-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{titulo}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
            {presupuestos.length}
          </span>
        </div>
        <svg
          className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      {presupuestos.length ? (
        <ul className="divide-y divide-gray-100 border-t border-gray-100">
          {presupuestos.map((b) => (
            <FilaPresupuesto key={b.id} b={b} />
          ))}
        </ul>
      ) : (
        <p className="border-t border-gray-100 px-4 py-6 text-center text-sm text-gray-500">
          {vacio}
        </p>
      )}
    </details>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El layout de /dashboard ya redirige a /login si no hay sesión, pero
  // Next.js puede empezar a renderizar esta página en paralelo antes de que
  // ese redirect se resuelva del todo — comprobamos otra vez por si acaso.
  if (!user) {
    redirect("/login");
  }

  const { data: budgets } = await supabase
    .from("budgets")
    .select(
      "id, cliente_nombre, vehiculo_marca, vehiculo_modelo, status, trabajo_terminado, created_at"
    )
    .eq("mechanic_id", user.id)
    .order("created_at", { ascending: false });

  const todos = budgets || [];
  const pendientes = todos.filter((b) => b.status === "pendiente");
  const aprobadosEnCurso = todos.filter((b) => b.status === "aprobado" && !b.trabajo_terminado);
  const finalizados = todos.filter(
    (b) => b.status === "rechazado" || (b.status === "aprobado" && b.trabajo_terminado)
  );

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

      {todos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
          Todavía no has creado ningún presupuesto.
        </p>
      ) : (
        <div className="space-y-4">
          <Bloque
            titulo="Pendientes"
            color="bg-yellow-100 text-yellow-800"
            presupuestos={pendientes}
            abierto
            vacio="No hay presupuestos esperando respuesta del cliente."
          />
          <Bloque
            titulo="Aprobados (en curso)"
            color="bg-green-100 text-green-800"
            presupuestos={aprobadosEnCurso}
            abierto
            vacio="No hay trabajos aprobados en curso ahora mismo."
          />
          <Bloque
            titulo="Finalizados"
            color="bg-gray-200 text-gray-700"
            presupuestos={finalizados}
            abierto={false}
            vacio="Todavía no hay presupuestos rechazados ni trabajos terminados."
          />
        </div>
      )}
    </div>
  );
}

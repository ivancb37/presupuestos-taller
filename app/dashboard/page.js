import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function estiloEstado(status, terminado) {
  if (status === "aprobado" && terminado) return "bg-slate-200 text-slate-700";
  if (status === "aprobado") return "bg-emerald-100 text-emerald-700";
  if (status === "rechazado") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-800";
}

function FilaPresupuesto({ b }) {
  return (
    <li>
      <Link
        href={`/dashboard/presupuestos/${b.id}`}
        className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50"
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{b.cliente_nombre}</p>
          <p className="truncate text-sm text-slate-500">
            {[b.vehiculo_marca, b.vehiculo_modelo].filter(Boolean).join(" ") ||
              "Sin datos de vehículo"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${estiloEstado(b.status, b.trabajo_terminado)}`}
        >
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
    <details
      open={abierto}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 select-none">
        <div className="flex items-center gap-2.5">
          <span className="font-display font-semibold text-slate-900">{titulo}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
            {presupuestos.length}
          </span>
        </div>
        <svg
          className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      {presupuestos.length ? (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {presupuestos.map((b) => (
            <FilaPresupuesto key={b.id} b={b} />
          ))}
        </ul>
      ) : (
        <p className="border-t border-slate-100 px-4 py-6 text-center text-sm text-slate-400">
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
        <h1 className="font-display text-2xl font-semibold text-slate-900">Presupuestos</h1>
        <Link
          href="/dashboard/presupuestos/nuevo"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500 active:bg-indigo-700"
        >
          + Nuevo presupuesto
        </Link>
      </div>

      {todos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
          <p className="text-4xl">🧾</p>
          <p className="mt-3 text-sm text-slate-500">
            Todavía no has creado ningún presupuesto.
          </p>
          <Link
            href="/dashboard/presupuestos/nuevo"
            className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Crea el primero →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <Bloque
            titulo="Pendientes"
            color="bg-amber-100 text-amber-800"
            presupuestos={pendientes}
            abierto
            vacio="No hay presupuestos esperando respuesta del cliente."
          />
          <Bloque
            titulo="Aprobados (en curso)"
            color="bg-emerald-100 text-emerald-700"
            presupuestos={aprobadosEnCurso}
            abierto
            vacio="No hay trabajos aprobados en curso ahora mismo."
          />
          <Bloque
            titulo="Finalizados"
            color="bg-slate-200 text-slate-700"
            presupuestos={finalizados}
            abierto={false}
            vacio="Todavía no hay presupuestos rechazados ni trabajos terminados."
          />
        </div>
      )}
    </div>
  );
}

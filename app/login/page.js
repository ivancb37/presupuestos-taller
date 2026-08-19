import AuthCard from "./auth-card";

const puntos = [
  "Crea el presupuesto en menos de un minuto",
  "El cliente lo aprueba desde el móvil, sin llamadas",
  "Comparte el enlace directo por WhatsApp",
];

// Server Component: se renderiza en el servidor, puede leer los parámetros
// de la URL (?error=..&mensaje=..) que las Server Actions usan para avisar
// del resultado tras un redirect. El formulario en sí vive en <AuthCard>,
// un componente cliente, porque necesita estado (para las pestañas).
export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;
  const mensaje = params?.mensaje;

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-900 md:flex md:flex-col md:justify-between md:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(129,140,248,0.25), transparent 40%)",
          }}
        />
        <div className="relative flex items-center gap-2 font-display text-lg font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-base">
            🔧
          </span>
          Presupuestos de Taller
        </div>

        <div className="relative space-y-6">
          <h1 className="font-display text-4xl font-semibold leading-tight text-white">
            Presupuestos claros,
            <br />
            aprobados en un click.
          </h1>
          <ul className="space-y-3">
            {puntos.map((punto) => (
              <li key={punto} className="flex items-start gap-3 text-slate-300">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm">{punto}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} Presupuestos de Taller
        </p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 font-display text-xl font-semibold text-slate-900 md:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-base">
              🔧
            </span>
            Presupuestos de Taller
          </div>

          <AuthCard error={error} mensaje={mensaje} />
        </div>
      </div>
    </main>
  );
}

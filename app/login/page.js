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
    <main className="flex min-h-screen flex-col bg-slate-900 md:grid md:grid-cols-2">
      <div className="relative flex flex-col gap-8 overflow-hidden px-6 pb-16 pt-10 md:justify-between md:bg-slate-900 md:p-12 md:pb-12">
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

        <div className="relative space-y-5 md:space-y-6">
          <h1 className="font-display text-2xl font-semibold leading-tight text-white md:text-4xl">
            Presupuestos claros,
            <br />
            aprobados en un click.
          </h1>
          <ul className="space-y-2.5 md:space-y-3">
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

        <p className="relative hidden text-xs text-slate-500 md:block">
          © {new Date().getFullYear()} Presupuestos de Taller
        </p>
      </div>

      {/* En móvil esto se dibuja como una "hoja" redondeada que sube por
         encima del panel oscuro (margen negativo + esquinas redondeadas),
         para que no haya un corte recto entre las dos zonas. En escritorio
         vuelve a ser una columna normal, ya separada por el grid. */}
      <div className="relative -mt-8 flex-1 rounded-t-[2rem] bg-slate-50 px-5 pb-12 pt-8 shadow-[0_-12px_30px_-10px_rgba(0,0,0,0.35)] md:mt-0 md:flex md:items-center md:justify-center md:rounded-none md:p-10 md:shadow-none">
        <div className="mx-auto w-full max-w-sm">
          <AuthCard error={error} mensaje={mensaje} />
        </div>
      </div>
    </main>
  );
}

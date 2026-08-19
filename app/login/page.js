import Link from "next/link";
import { login, signup } from "./actions";

// Server Component: se renderiza en el servidor, puede leer los parámetros
// de la URL (?error=..&mensaje=..) que las Server Actions usan para avisar
// del resultado tras un redirect.
export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;
  const mensaje = params?.mensaje;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Presupuestos de Taller
        </h1>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {mensaje && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {mensaje}
          </p>
        )}

        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Entrar</h2>
          <form className="space-y-3">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              formAction={login}
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Entrar
            </button>
          </form>
          <p className="text-right text-sm">
            <Link href="/recuperar" className="text-blue-600 hover:text-blue-800">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </section>

        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Crear cuenta de taller
          </h2>
          <form className="space-y-3">
            <input
              name="nombre_taller"
              type="text"
              placeholder="Nombre del taller"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              name="password"
              type="password"
              placeholder="Contraseña (mín. 6 caracteres)"
              required
              minLength={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              formAction={signup}
              className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Crear cuenta
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

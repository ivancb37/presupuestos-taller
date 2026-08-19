import Link from "next/link";
import RecuperarForm from "./recuperar-form";

export default function RecuperarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg">
            🔧
          </span>
          <h1 className="font-display text-2xl font-semibold text-slate-900">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-slate-500">
            Te enviaremos un enlace a tu email para poner una contraseña nueva.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
          <RecuperarForm />
        </section>

        <p className="text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Volver al login
          </Link>
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import RecuperarForm from "./recuperar-form";

export default function RecuperarPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-gray-500">
            Te enviaremos un enlace a tu email para poner una contraseña nueva.
          </p>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <RecuperarForm />
        </section>

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-800">
            Volver al login
          </Link>
        </p>
      </div>
    </main>
  );
}

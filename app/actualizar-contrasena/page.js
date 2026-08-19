import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import NuevaContrasenaForm from "./nueva-contrasena-form";

export default async function ActualizarContrasenaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg">
            🔧
          </span>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Nueva contraseña</h1>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
          {user ? (
            <NuevaContrasenaForm />
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-sm text-slate-600">
                Este enlace no es válido o ha caducado. Pide uno nuevo.
              </p>
              <Link
                href="/recuperar"
                className="inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Pedir enlace nuevo
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

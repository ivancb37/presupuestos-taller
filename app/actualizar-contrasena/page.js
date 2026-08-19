import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import NuevaContrasenaForm from "./nueva-contrasena-form";

export default async function ActualizarContrasenaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Nueva contraseña
        </h1>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {user ? (
            <NuevaContrasenaForm />
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-sm text-gray-600">
                Este enlace no es válido o ha caducado. Pide uno nuevo.
              </p>
              <Link
                href="/recuperar"
                className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
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

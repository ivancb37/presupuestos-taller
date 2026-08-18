import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { logout } from "./actions";

// Layout compartido por todo lo que cuelgue de /dashboard. Al ser un Server
// Component puede comprobar la sesión ANTES de renderizar nada: si no hay
// usuario logueado, redirige a /login. Así protegemos todas las páginas
// hijas (nueva, detalle, etc.) sin repetir esta comprobación en cada una.
export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre_taller")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="font-semibold text-gray-900">
            {profile?.nombre_taller || "Mi taller"}
          </Link>
          <form action={logout}>
            <button className="text-sm text-gray-500 hover:text-gray-900">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}

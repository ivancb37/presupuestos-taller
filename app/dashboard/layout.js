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

  const inicial = (profile?.nombre_taller || "T").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-display font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm">
              🔧
            </span>
            {profile?.nombre_taller || "Mi taller"}
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 sm:flex">
              {inicial}
            </span>
            <form action={logout}>
              <button className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}

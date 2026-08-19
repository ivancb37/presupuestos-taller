import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Punto de entrada único para los enlaces que Supabase manda por email
// (confirmación de registro, recuperación de contraseña...). El email trae
// un "code" de un solo uso; lo canjeamos aquí por una sesión real (esto
// escribe las cookies de sesión) y luego mandamos al usuario a "next".
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("El enlace no es válido o ha caducado. Pide uno nuevo.")}`
  );
}

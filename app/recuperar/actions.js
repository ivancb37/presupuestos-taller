"use server";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function solicitarRecuperacion(formData) {
  const email = formData.get("email");
  if (!email) {
    return { error: "Escribe tu email." };
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `${headerList.get("x-forwarded-proto") || "http"}://${headerList.get("host")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/actualizar-contrasena`,
  });

  if (error) {
    return { error: error.message };
  }

  // Por seguridad, Supabase no distingue si el email existe o no en la
  // respuesta — así que siempre mostramos el mismo mensaje de éxito,
  // exista o no esa cuenta (evita que alguien use esto para averiguar
  // qué emails están registrados).
  return {
    ok: true,
    mensaje: "Si ese email tiene una cuenta, te hemos enviado un enlace para restablecer la contraseña.",
  };
}

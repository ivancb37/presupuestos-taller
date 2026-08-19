"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function actualizarContrasena(formData) {
  const password = formData.get("password");

  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createClient();

  // Esto solo funciona porque /auth/callback ya canjeó el código del email
  // y dejó al usuario con una sesión de recuperación activa (ver esa route).
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

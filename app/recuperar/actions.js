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

  // DEBUG temporal: esto nos deja ver en los logs de Vercel qué valores
  // reales está usando en producción, para cazar el bug del ByteString.
  console.log("DEBUG origin:", JSON.stringify(origin));
  console.log("DEBUG host header:", JSON.stringify(headerList.get("host")));
  console.log("DEBUG proto header:", JSON.stringify(headerList.get("x-forwarded-proto")));
  console.log("DEBUG NEXT_PUBLIC_SITE_URL:", JSON.stringify(process.env.NEXT_PUBLIC_SITE_URL));
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  console.log("DEBUG anon key length:", rawKey.length);
  console.log("DEBUG anon key char at 15:", rawKey.charCodeAt(15), JSON.stringify(rawKey[15]));
  console.log("DEBUG anon key first 20:", JSON.stringify(rawKey.slice(0, 20)));
  console.log("DEBUG anon key last 10:", JSON.stringify(rawKey.slice(-10)));
  for (let i = 0; i < rawKey.length; i++) {
    if (rawKey.charCodeAt(i) > 255) {
      console.log("DEBUG BAD CHAR at index", i, "code", rawKey.charCodeAt(i));
    }
  }

  let result;
  try {
    result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/actualizar-contrasena`,
    });
  } catch (e) {
    console.error("DEBUG thrown error name:", e?.name);
    console.error("DEBUG thrown error message:", e?.message);
    console.error("DEBUG thrown error stack:", e?.stack);
    return { error: `DEBUG throw: ${e?.message}` };
  }

  const { error } = result;

  if (error) {
    console.error("DEBUG supabase error:", JSON.stringify(error));
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

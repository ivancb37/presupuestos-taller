"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Las Server Actions son funciones que se ejecutan en el servidor pero se
// llaman directamente desde un <form action={...}> en el cliente, sin tener
// que montar una API a mano. Next.js se encarga de la comunicación.

export async function login(formData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signup(formData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get("email"),
    password: formData.get("password"),
    options: {
      data: {
        // Esto llega a raw_user_meta_data, que lee el trigger
        // handle_new_user() en Supabase para rellenar profiles.nombre_taller.
        nombre_taller: formData.get("nombre_taller"),
      },
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?mensaje=Revisa+tu+email+para+confirmar+la+cuenta");
}

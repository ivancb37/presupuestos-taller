"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// Llama a la función SQL `respond_public_budget`, que es la única forma en
// que un visitante sin login puede cambiar el estado de un presupuesto —
// y solo el de ESE token, y solo si sigue "pendiente" (ver comentario en
// supabase/schema.sql).
export async function responder(token, decision) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("respond_public_budget", {
    p_token: token,
    p_decision: decision,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/p/${token}`);
  return data;
}

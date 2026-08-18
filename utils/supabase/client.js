import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para usar en componentes que corren en el navegador
// ("use client"). Lee las variables NEXT_PUBLIC_* de .env.local.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

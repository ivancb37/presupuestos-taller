import { redirect } from "next/navigation";

// La raíz "/" no tiene contenido propio: manda directamente a /dashboard.
// Si hay sesión, el mecánico ve su panel; si no, el layout de /dashboard
// ya se encarga de redirigir a /login (ver app/dashboard/layout.js).
export default function Home() {
  redirect("/dashboard");
}

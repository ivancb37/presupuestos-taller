import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

// Dos fuentes con personalidad distinta en vez de una sola genérica:
// Space Grotesk (geométrica, algo técnica) para títulos y cifras — encaja
// con una app de presupuestos/precios — e Inter para el texto normal,
// que es de las tipografías más legibles en pantalla que hay.
const fuenteDisplay = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const fuenteBase = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata = {
  title: "Presupuestos de Taller",
  description: "Crea presupuestos de reparación y compártelos con tus clientes por WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${fuenteDisplay.variable} ${fuenteBase.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}

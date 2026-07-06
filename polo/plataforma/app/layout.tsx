import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Polo Tecnológico del Paraná — Plataforma",
  description:
    "Descubrí empresas tecnológicas de la región y publicá ideas para que las tomen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>
        <Nav />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-slate-400">
          Plataforma demo · Polo Tecnológico del Paraná · Paraná, Entre Ríos
        </footer>
      </body>
    </html>
  );
}

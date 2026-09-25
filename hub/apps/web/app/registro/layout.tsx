import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse — GamER Hub",
  description: "Crea tu cuenta en GamER Hub y únete a la comunidad gamer.",
  openGraph: {
    title: "Registrarse — GamER Hub",
    description: "Únete a GamER Hub.",
    locale: "es_AR",
    type: "website",
  },
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children;
}

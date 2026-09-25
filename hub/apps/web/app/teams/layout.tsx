import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equipos — GamER Hub",
  description: "Explora, crea y administra equipos de desarrollo en GamER Hub.",
  openGraph: {
    title: "Equipos — GamER Hub",
    description: "Gestiona tu equipo.",
    locale: "es_AR",
    type: "website",
  },
};

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paraná Game Jam — Entre Ríos Gamers",
  description:
    "Participa en la Paraná Game Jam, una competencia de desarrollo de videojuegos de 48 horas.",
  icons: {
    icon: "/jam/logo.svg",
  },
  openGraph: {
    title: "Paraná Game Jam — Entre Ríos Gamers",
    description: "Participa en la Paraná Game Jam 2026.",
    locale: "es_AR",
    type: "website",
  },
};

export default function JamLayout({ children }: { children: React.ReactNode }) {
  return children;
}

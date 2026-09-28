import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GameDevs — Entre Ríos Gamers",
  description:
    "Comunidad de desarrolladores de videojuegos de Entre Ríos. Networking, recursos y oportunidades.",
  icons: {
    icon: "/ergd-icon-color.svg",
  },
  openGraph: {
    title: "GameDevs — Entre Ríos Gamers",
    description: "Comunidad de desarrolladores de videojuegos.",
    locale: "es_AR",
    type: "website",
  },
};

export default function DevsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

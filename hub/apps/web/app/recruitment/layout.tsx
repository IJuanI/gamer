import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reclutamiento — GamER Hub",
  description:
    "Publica ofertas de trabajo o busca equipos. Conecta con desarrolladores y diseñadores de Entre Ríos.",
  openGraph: {
    title: "Reclutamiento — GamER Hub",
    description: "Publica ofertas o busca oportunidades.",
    locale: "es_AR",
    type: "website",
  },
};

export default function RecruitmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}

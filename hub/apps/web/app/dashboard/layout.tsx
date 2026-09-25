import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Panel — GamER Hub",
  description: "Tu panel de control en GamER Hub. Gestiona tu perfil, equipos y participaciones.",
  openGraph: {
    title: "Mi Panel — GamER Hub",
    description: "Tu espacio personal.",
    locale: "es_AR",
    type: "website",
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingresar — GamER Hub",
  description: "Ingresa a tu cuenta de GamER Hub.",
  openGraph: {
    title: "Ingresar — GamER Hub",
    description: "Ingresa a tu cuenta.",
    locale: "es_AR",
    type: "website",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

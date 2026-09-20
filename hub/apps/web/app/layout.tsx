import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/lib/theme-context";
import { TelemetryInit } from "@/components/telemetry-init";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GamER Hub — Entre Ríos Gamers",
  description:
    "El hub de la comunidad gamer de Entre Ríos. Torneos, eventos y comunidad en un solo lugar.",
  openGraph: {
    title: "GamER Hub — Entre Ríos Gamers",
    description: "El hub de la comunidad gamer de Entre Ríos.",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-background text-foreground">
        <TelemetryInit />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

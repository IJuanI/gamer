"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
require("./globals.css");
const auth_provider_1 = require("@/components/auth-provider");
const inter = (0, google_1.Inter)({ variable: "--font-inter", subsets: ["latin"] });
exports.metadata = {
    title: "GamER Hub — Entre Ríos Gamers",
    description: "El hub de la comunidad gamer de Entre Ríos. Torneos, eventos y comunidad en un solo lugar.",
    openGraph: {
        title: "GamER Hub — Entre Ríos Gamers",
        description: "El hub de la comunidad gamer de Entre Ríos.",
        locale: "es_AR",
        type: "website",
    },
};
function RootLayout({ children }) {
    return (<html lang="es-AR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <auth_provider_1.AuthProvider>{children}</auth_provider_1.AuthProvider>
      </body>
    </html>);
}

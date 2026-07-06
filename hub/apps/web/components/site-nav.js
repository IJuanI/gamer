"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteNav = SiteNav;
const link_1 = __importDefault(require("next/link"));
const logo_1 = require("./logo");
const auth_provider_1 = require("./auth-provider");
function SiteNav() {
    const { user, loading } = (0, auth_provider_1.useAuth)();
    return (<header className="sticky top-0 z-50 border-b border-white/5 bg-[#12121E]/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <logo_1.Logo />
        <div className="flex items-center gap-3 text-sm">
          <link_1.default href="/#comunidad" className="text-[var(--text-secondary)] hover:text-white transition-colors hidden sm:block">
            Comunidad
          </link_1.default>
          <link_1.default href="/#features" className="text-[var(--text-secondary)] hover:text-white transition-colors hidden sm:block">
            Qué hacemos
          </link_1.default>
          {loading ? null : user ? (<link_1.default href="/dashboard" className="rounded-md neon-border-purple px-4 py-2 font-medium text-white transition-transform hover:scale-105">
              Mi panel
            </link_1.default>) : (<>
              <link_1.default href="/login" className="px-3 py-2 text-[var(--text-secondary)] hover:text-white transition-colors">
                Ingresar
              </link_1.default>
              <link_1.default href="/register" className="rounded-md bg-[var(--gamer-purple)] px-4 py-2 font-medium text-white box-glow-purple transition-transform hover:scale-105">
                Unirme
              </link_1.default>
            </>)}
        </div>
      </nav>
    </header>);
}

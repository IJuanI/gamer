"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthShell = AuthShell;
exports.Field = Field;
const link_1 = __importDefault(require("next/link"));
const logo_1 = require("./logo");
/** Branded centered card used by the login and register pages. */
function AuthShell({ title, subtitle, children, }) {
    return (<main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-grid-neon-fade"/>
      <div className="pointer-events-none absolute inset-0 radial-glow-purple"/>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <logo_1.Logo size="lg"/>
        </div>

        <div className="relative panel-clip border border-white/8 bg-[var(--background-elevated)] p-8">
          <div className="hud-bracket-tl"/>
          <div className="hud-bracket-br"/>
          <h1 className="font-azonix text-2xl text-white">{title}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <link_1.default href="/" className="hover:text-white transition-colors">
            ← Volver al inicio
          </link_1.default>
        </p>
      </div>
    </main>);
}
function Field({ label, ...props }) {
    return (<label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      <input {...props} className="w-full rounded-md border border-white/10 bg-[#12121E] px-3.5 py-2.5 text-white outline-none transition-colors focus:border-[var(--gamer-purple)] focus:box-glow-purple"/>
    </label>);
}

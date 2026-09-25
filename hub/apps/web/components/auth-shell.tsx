import Link from "next/link";
import { Logo } from "./logo";

/** Branded centered card used by the login and register pages. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-grid-neon-fade" />
      <div className="pointer-events-none absolute inset-0 radial-glow-purple" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="relative panel-clip border border-white/8 bg-[var(--background-elevated)] p-8">
          <div className="hud-bracket-tl" />
          <div className="hud-bracket-br" />
          <h1 className="font-azonix text-2xl text-[var(--foreground)]">{title}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/" className="hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-md border border-white/10 bg-[#12121E] px-3.5 py-2.5 text-white outline-none transition-colors focus:border-[var(--gamer-purple)] focus:box-glow-purple"
      />
    </label>
  );
}

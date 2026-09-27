"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";
import { Role } from "@gamer/shared";
import { useAuth } from "@/components/auth-provider";
import { JamFlyer } from "@/components/flyers/jam-flyer";
import { JAM_FLYER_DATA, type JamFlyerData } from "@/lib/jam-flyer-data";
import { FLYER_FORMAT_LIST, FLYER_FORMATS } from "@/lib/flyer-formats";
import { exportFlyer } from "@/lib/export-flyer";

export const dynamic = "force-dynamic";

const PREVIEW_WIDTH = 340;

function AdminFlyersContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [formatId, setFormatId] = useState(FLYER_FORMAT_LIST[0].id);
  const [event, setEvent] = useState<JamFlyerData>(JAM_FLYER_DATA);
  const [exporting, setExporting] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  const format = FLYER_FORMATS[formatId];
  const scale = PREVIEW_WIDTH / format.width;

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && user.role !== Role.EDITOR && user.role !== Role.ADMIN) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading || !user || (user.role !== Role.EDITOR && user.role !== Role.ADMIN)) {
    return (
      <main className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Cargando…
      </main>
    );
  }

  async function handleExport() {
    if (!flyerRef.current) return;
    setExporting(true);
    try {
      await exportFlyer(flyerRef.current, `parana-game-jam-${format.id}`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <header className="relative border-b border-white/5 bg-[#12121E]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <h1 className="font-azonix text-lg text-white">Generador de flyers</h1>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-5xl gap-8 px-6 py-12 lg:grid-cols-[340px_1fr]">
        {/* Preview */}
        <div>
          <p className="mb-3 text-sm text-[var(--muted)]">Vista previa — {format.name} ({format.width}×{format.height})</p>
          <div
            className="overflow-hidden rounded-lg border border-white/8"
            style={{ width: PREVIEW_WIDTH, height: format.height * scale }}
          >
            <div style={{ width: format.width, height: format.height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <JamFlyer event={event} format={format} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Formato</h2>
            <div className="flex flex-wrap gap-2">
              {FLYER_FORMAT_LIST.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormatId(f.id)}
                  className="rounded-md border px-3 py-2 text-sm transition-colors"
                  style={
                    f.id === formatId
                      ? { borderColor: "var(--gamer-purple)", color: "var(--gamer-purple-text)", backgroundColor: "rgba(179,57,196,0.1)" }
                      : { borderColor: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" }
                  }
                >
                  {f.name}
                </button>
              ))}
            </div>
          </section>

          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Contenido</h2>
            <div className="space-y-4">
              <Field label="Eyebrow" value={event.eyebrow} onChange={(v) => setEvent({ ...event, eyebrow: v })} />
              <Field label="Fecha" value={event.dateRange} onChange={(v) => setEvent({ ...event, dateRange: v })} />
              <Field label="Lugar" value={event.venue} onChange={(v) => setEvent({ ...event, venue: v })} />
              <Field label="Ciudad" value={event.city} onChange={(v) => setEvent({ ...event, city: v })} />
            </div>
          </section>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-md px-5 py-3 font-medium text-white transition-transform hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: "var(--gamer-purple)" }}
          >
            <Download className="h-4 w-4" /> {exporting ? "Exportando…" : "Descargar PNG"}
          </button>
        </div>

        {/* Off-screen full-resolution render used for export */}
        <div style={{ position: "fixed", top: 0, left: -99999 }}>
          <div ref={flyerRef}>
            <JamFlyer event={event} format={format} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminFlyersPage() {
  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid-neon-fade" />
      <AdminFlyersContent />
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const className =
    "w-full rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-sm text-white outline-none focus:border-[var(--gamer-purple)]";
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">{label}</span>
      {textarea ? (
        <textarea className={className} rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={className} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";
import { Role } from "@gamer/shared";
import { useAuth } from "@/components/auth-provider";
import { Flyer } from "@/components/flyers/flyer";
import { FLYER_BRAND_LIST, FLYER_BRANDS, type FlyerBrand } from "@/lib/flyer-brands";
import { FLYER_FORMAT_LIST, FLYER_FORMATS, type FlyerFormatId } from "@/lib/flyer-formats";
import { EVENT_VARIANTS, FLYER_DEFAULTS, FLYER_KINDS, type EventVariant, type FlyerData, type FlyerKind } from "@/lib/flyer-kinds";
import { exportFlyer } from "@/lib/export-flyer";

export const dynamic = "force-dynamic";

const PREVIEW_WIDTH = 340;

function AdminFlyersContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [brand, setBrand] = useState<FlyerBrand>("jam");
  const [kind, setKind] = useState<FlyerKind>("event");
  const [variant, setVariant] = useState<EventVariant>("principal");
  const [formatId, setFormatId] = useState<FlyerFormatId>("instagram-story");
  const [data, setData] = useState<FlyerData>(FLYER_DEFAULTS.jam);
  const [now, setNow] = useState<Date>(() => new Date());
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

  // Keeps countdown flyers live in the preview.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);

  if (loading || !user || (user.role !== Role.EDITOR && user.role !== Role.ADMIN)) {
    return (
      <main className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Cargando…
      </main>
    );
  }

  function pickBrand(next: FlyerBrand) {
    setBrand(next);
    setData(FLYER_DEFAULTS[next]);
  }

  async function handleExport() {
    if (!flyerRef.current) return;
    setExporting(true);
    try {
      await exportFlyer(flyerRef.current, `${brand}-${kind}${kind === "event" ? `-${variant}` : ""}-${format.id}`);
    } finally {
      setExporting(false);
    }
  }

  const flyerProps = { brand, kind, variant, data, format, now };

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
          <p className="mb-3 text-sm text-[var(--muted)]">
            Vista previa — {FLYER_BRANDS[brand].name} · {FLYER_KINDS[kind].label} · {format.name} ({format.width}×{format.height})
          </p>
          <div className="overflow-hidden rounded-lg border border-white/8" style={{ width: PREVIEW_WIDTH, height: format.height * scale }}>
            <div style={{ width: format.width, height: format.height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <Flyer {...flyerProps} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Marca</h2>
            <Chips
              options={FLYER_BRAND_LIST.map((b) => ({ id: b.id, label: b.name }))}
              value={brand}
              onChange={(id) => pickBrand(id as FlyerBrand)}
            />
          </section>

          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Tipo</h2>
            <Chips
              options={(Object.keys(FLYER_KINDS) as FlyerKind[]).map((k) => ({ id: k, label: FLYER_KINDS[k].label }))}
              value={kind}
              onChange={(id) => setKind(id as FlyerKind)}
            />
            <p className="mt-3 text-sm text-[var(--muted)]">{FLYER_KINDS[kind].hint}</p>
            {kind === "event" && (
              <div className="mt-5">
                <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Variante para repostear</p>
                <Chips
                  options={(Object.keys(EVENT_VARIANTS) as EventVariant[]).map((v) => ({ id: v, label: EVENT_VARIANTS[v].label }))}
                  value={variant}
                  onChange={(id) => setVariant(id as EventVariant)}
                />
              </div>
            )}
          </section>

          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Formato</h2>
            <Chips
              options={FLYER_FORMAT_LIST.map((f) => ({ id: f.id, label: f.name }))}
              value={formatId}
              onChange={(id) => setFormatId(id as FlyerFormatId)}
            />
          </section>

          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Contenido</h2>
            <div className="space-y-4">
              <Field label="Eyebrow" value={data.eyebrow} onChange={(v) => setData({ ...data, eyebrow: v })} />
              <Field label="Título" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
              <Field label="Subtítulo" value={data.subtitle} onChange={(v) => setData({ ...data, subtitle: v })} />
              {kind !== "countdown" && (
                <Field label="Fecha (texto)" value={data.dateText} onChange={(v) => setData({ ...data, dateText: v })} />
              )}
              {kind === "event" && <Field label="Lugar" value={data.venue} onChange={(v) => setData({ ...data, venue: v })} />}
              <Field label="Ciudad" value={data.city} onChange={(v) => setData({ ...data, city: v })} />
              {kind === "countdown" && (
                <Field
                  label="Fecha y hora objetivo (ISO, con offset)"
                  value={data.countdownTo}
                  onChange={(v) => setData({ ...data, countdownTo: v })}
                />
              )}
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
            <Flyer {...flyerProps} />
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
      <Suspense fallback={null}>
        <AdminFlyersContent />
      </Suspense>
    </main>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className="rounded-md border px-3 py-2 text-sm transition-colors"
          style={
            o.id === value
              ? { borderColor: "var(--gamer-purple)", color: "var(--gamer-purple-text)", backgroundColor: "rgba(179,57,196,0.1)" }
              : { borderColor: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" }
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const className =
    "w-full rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-sm text-white outline-none focus:border-[var(--gamer-purple)]";
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">{label}</span>
      <input className={className} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

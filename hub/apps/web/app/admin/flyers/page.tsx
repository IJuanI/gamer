"use client";

import { useEffect, useId, useRef, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, ArrowLeft, Eye, EyeOff, Plus, Trash2, Upload, Package } from "lucide-react";
import { Role } from "@gamer/shared";
import { useAuth } from "@/components/auth-provider";
import { Flyer } from "@/components/flyers/flyer";
import { FLYER_BRAND_LIST, FLYER_BRANDS, type FlyerBrand } from "@/lib/flyer-brands";
import { FLYER_FORMAT_LIST, FLYER_FORMATS, type FlyerFormatId } from "@/lib/flyer-formats";
import {
  BACKGROUNDS,
  EVENT_VARIANTS,
  FLYER_DEFAULTS,
  FLYER_KINDS,
  INFOGRAPHIC_VARIANTS,
  MAX_SPONSORS,
  type EventVariant,
  type FlyerBackground,
  type FlyerData,
  type FlyerFieldKey,
  type FlyerHidden,
  type FlyerKind,
  type InfographicVariant,
  type VenueMode,
} from "@/lib/flyer-kinds";
import { EXPORT_SCALES, exportDesignElements, exportFlyer, type ExportScale } from "@/lib/export-flyer";
import { useFitWidth } from "@/lib/use-fit-width";

export const dynamic = "force-dynamic";

const PREVIEW_WIDTH = 340;
const DEFAULT_SCALE: ExportScale = 2;

function AdminFlyersContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [brand, setBrand] = useState<FlyerBrand>("gamer");
  const [kind, setKind] = useState<FlyerKind>("event");
  const [variant, setVariant] = useState<EventVariant>("principal");
  const [infoVariant, setInfoVariant] = useState<InfographicVariant>("tarjetas");
  const [formatId, setFormatId] = useState<FlyerFormatId>("instagram-story");
  const [data, setData] = useState<FlyerData>(FLYER_DEFAULTS.gamer);
  const [hidden, setHidden] = useState<FlyerHidden>({});
  const [now, setNow] = useState<Date>(() => new Date());
  const [scale, setScale] = useState<ExportScale>(DEFAULT_SCALE);
  const [exporting, setExporting] = useState<null | "png" | "zip">(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const [previewRef, previewBox] = useFitWidth<HTMLDivElement>(PREVIEW_WIDTH);

  const format = FLYER_FORMATS[formatId];
  const previewWidth = previewBox || PREVIEW_WIDTH;
  const previewScale = previewWidth / format.width;

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

  function toggleHidden(key: FlyerFieldKey) {
    setHidden((h) => ({ ...h, [key]: !h[key] }));
  }

  function pickVenueMode(mode: VenueMode) {
    setData({ ...data, venue: { ...data.venue, mode } });
  }

  function uploadVenueLogo(file: File | undefined) {
    if (!file) return;
    readAsDataUrl(file, (src) =>
      setData((d) => ({ ...d, venue: { ...d.venue, mode: "logo", logoSrc: src } })),
    );
  }

  function uploadEventLogo(file: File | undefined) {
    if (!file) return;
    readAsDataUrl(file, (src) => setData((d) => ({ ...d, eventLogo: src })));
  }

  function addSponsor(file: File | undefined) {
    if (!file) return;
    if (data.sponsors.length >= MAX_SPONSORS) return;
    const name = file.name.replace(/\.[^.]+$/, "") || `Patrocinador ${data.sponsors.length + 1}`;
    readAsDataUrl(file, (src) => setData((d) => ({ ...d, sponsors: [...d.sponsors, { name, src }] })));
  }

  function renameSponsor(index: number, name: string) {
    setData((d) => ({ ...d, sponsors: d.sponsors.map((s, i) => (i === index ? { ...s, name } : s)) }));
  }

  function removeSponsor(index: number) {
    setData((d) => ({ ...d, sponsors: d.sponsors.filter((_, i) => i !== index) }));
  }

  function fileBase() {
    const layout = kind === "event" ? `-${variant}` : kind === "infographic" ? `-${infoVariant}` : "";
    return `${brand}-${kind}${layout}-${format.id}`;
  }

  async function handleExport() {
    if (!flyerRef.current) return;
    setExporting("png");
    setExportError(null);
    try {
      await exportFlyer(flyerRef.current, fileBase(), scale);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "No se pudo exportar el PNG.");
    } finally {
      setExporting(null);
    }
  }

  async function handleDesignElements() {
    if (!flyerRef.current) return;
    setExporting("zip");
    setExportError(null);
    try {
      // The brand logo, the venue logo, the event logo and every sponsor logo go into the logos folder.
      const logos = [
        { name: `${brand}-logo`, src: FLYER_BRANDS[brand].logo },
        ...(data.venue.mode === "logo" && data.venue.logoSrc ? [{ name: "lugar", src: data.venue.logoSrc }] : []),
        ...(data.eventLogo ? [{ name: "logo-evento", src: data.eventLogo }] : []),
        ...data.sponsors.map((s, i) => ({ name: `patrocinador-${i + 1}-${slug(s.name)}`, src: s.src })),
      ];
      await exportDesignElements({ node: flyerRef.current, filename: fileBase(), logos });
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "No se pudo generar el zip.");
    } finally {
      setExporting(null);
    }
  }

  const flyerProps = { brand, kind, variant, infoVariant, data, format, now, hidden };

  return (
    <>
      <header className="relative border-b border-white/5 bg-[#12121E]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="flex min-h-11 items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/admin/flyers/story" className="flex min-h-11 items-center text-sm text-[var(--text-secondary)] hover:text-white">
              Story en video
            </Link>
            <h1 className="font-azonix text-base text-white sm:text-lg">Generador de flyers</h1>
          </div>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 sm:py-12 lg:grid-cols-[340px_1fr] lg:gap-8">
        {/* Preview. Sticks to the top on desktop so the controls can scroll past it. */}
        <div ref={previewRef} className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-sm text-[var(--muted)]">
            Vista previa — {FLYER_BRANDS[brand].name} · {FLYER_KINDS[kind].label} · {format.name} ({format.width}×{format.height})
          </p>
          <div className="overflow-hidden rounded-lg border border-white/8" style={{ width: previewWidth, height: format.height * previewScale }}>
            <div style={{ width: format.width, height: format.height, transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
              <Flyer {...flyerProps} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Escala de exportación</p>
            <Chips
              options={EXPORT_SCALES.map((s) => ({ id: String(s), label: `${s}x · ${format.width * s}×${format.height * s}` }))}
              value={String(scale)}
              onChange={(id) => setScale(Number(id) as ExportScale)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void handleExport()}
                disabled={exporting !== null}
                className="flex min-h-11 items-center gap-2 rounded-md px-5 py-3 font-medium text-white transition-transform hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: "var(--gamer-purple)" }}
              >
                <Download className="h-4 w-4" /> {exporting === "png" ? "Exportando…" : `Descargar PNG (${scale}x)`}
              </button>
              <button
                onClick={() => void handleDesignElements()}
                disabled={exporting !== null}
                className="flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-5 py-3 font-medium text-white hover:bg-white/5 disabled:opacity-50"
              >
                <Package className="h-4 w-4" /> {exporting === "zip" ? "Generando zip…" : "Descargar elementos (.zip, 2x)"}
              </button>
            </div>
            <p className="text-xs text-[var(--muted)]">
              El zip trae el fondo base, los elementos de fondo, los del frente (sobre transparencia), los logos y las fuentes.
            </p>
            {exportError && <p className="text-sm text-red-400">{exportError}</p>}
          </div>
        </div>

        {/* Controls */}
        <div className="min-w-0 space-y-6">
          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-4 sm:p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Marca</h2>
            <Chips
              options={FLYER_BRAND_LIST.map((b) => ({ id: b.id, label: b.name }))}
              value={brand}
              onChange={(id) => pickBrand(id as FlyerBrand)}
            />
          </section>

          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-4 sm:p-6">
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
            {kind === "infographic" && (
              <div className="mt-5">
                <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Diseño</p>
                <Chips
                  options={(Object.keys(INFOGRAPHIC_VARIANTS) as InfographicVariant[]).map((v) => ({
                    id: v,
                    label: INFOGRAPHIC_VARIANTS[v].label,
                  }))}
                  value={infoVariant}
                  onChange={(id) => setInfoVariant(id as InfographicVariant)}
                />
                <p className="mt-2 text-sm text-[var(--muted)]">{INFOGRAPHIC_VARIANTS[infoVariant].hint}</p>
              </div>
            )}
          </section>

          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-4 sm:p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Formato</h2>
            <Chips
              options={FLYER_FORMAT_LIST.map((f) => ({ id: f.id, label: f.name }))}
              value={formatId}
              onChange={(id) => setFormatId(id as FlyerFormatId)}
            />
          </section>

          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-4 sm:p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Fondo</h2>
            <Chips
              options={(Object.keys(BACKGROUNDS) as FlyerBackground[]).map((b) => ({ id: b, label: BACKGROUNDS[b].label }))}
              value={data.background}
              onChange={(id) => setData({ ...data, background: id as FlyerBackground })}
            />
            <p className="mt-3 text-sm text-[var(--muted)]">{BACKGROUNDS[data.background].hint}</p>
          </section>

          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-4 sm:p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Contenido</h2>
            <p className="mb-4 text-sm text-[var(--muted)]">El ojo quita ese bloque del flyer por completo.</p>
            <div className="space-y-4">
              <Field
                label="Eyebrow"
                value={data.eyebrow}
                onChange={(v) => setData({ ...data, eyebrow: v })}
                hidden={hidden.eyebrow}
                onToggle={() => toggleHidden("eyebrow")}
              />
              <Field
                label="Título"
                value={data.title}
                onChange={(v) => setData({ ...data, title: v })}
                hidden={hidden.title}
                onToggle={() => toggleHidden("title")}
              />
              <Field
                label="Subtítulo"
                value={data.subtitle}
                onChange={(v) => setData({ ...data, subtitle: v })}
                hidden={hidden.subtitle}
                onToggle={() => toggleHidden("subtitle")}
              />
              {kind !== "countdown" && kind !== "infographic" && (
                <Field
                  label="Fecha (texto)"
                  value={data.dateText}
                  placeholder="Vacío = Próximamente"
                  onChange={(v) => setData({ ...data, dateText: v })}
                  hidden={hidden.date}
                  onToggle={() => toggleHidden("date")}
                />
              )}
              {kind === "event" && (
                <div className="block">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[var(--muted)]">Lugar</span>
                    <EyeToggle hidden={hidden.venue} onToggle={() => toggleHidden("venue")} />
                  </div>
                  <Chips
                    options={[
                      { id: "mirador", label: "MiradorTEC" },
                      { id: "text", label: "Texto libre" },
                      { id: "logo", label: "Subir logo" },
                      { id: "none", label: "Sin lugar" },
                    ]}
                    value={data.venue.mode}
                    onChange={(id) => pickVenueMode(id as VenueMode)}
                  />
                  {data.venue.mode === "text" && (
                    <div className="mt-3">
                      <Field
                        label="Texto del lugar"
                        value={data.venue.text}
                        onChange={(v) => setData({ ...data, venue: { ...data.venue, text: v } })}
                      />
                    </div>
                  )}
                  {data.venue.mode === "logo" && (
                    <div className="mt-3">
                      <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">
                        Logo del lugar (PNG, JPG o SVG)
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        onChange={(e) => uploadVenueLogo(e.target.files?.[0])}
                        className="text-base text-[var(--text-secondary)] sm:text-sm"
                      />
                      {data.venue.logoSrc && <p className="mt-1 text-xs text-[var(--muted)]">Logo cargado.</p>}
                    </div>
                  )}
                </div>
              )}
              <Field
                label="Ciudad"
                value={data.city}
                onChange={(v) => setData({ ...data, city: v })}
                hidden={hidden.city}
                onToggle={() => toggleHidden("city")}
              />
              {kind === "countdown" && (
                <Field
                  label="Fecha y hora objetivo (ISO, con offset)"
                  value={data.countdownTo}
                  onChange={(v) => setData({ ...data, countdownTo: v })}
                  hidden={hidden.countdown}
                  onToggle={() => toggleHidden("countdown")}
                />
              )}
              {kind === "infographic" && (
                <div className="block">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                      Datos (una línea por dato: Etiqueta | Valor)
                    </span>
                    <EyeToggle hidden={hidden.items} onToggle={() => toggleHidden("items")} />
                  </div>
                  <textarea
                    rows={6}
                    value={data.itemsText}
                    disabled={hidden.items}
                    onChange={(e) => setData({ ...data, itemsText: e.target.value })}
                    className="w-full rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-base text-white outline-none focus:border-[var(--gamer-purple)] disabled:opacity-40 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Un valor “usados/total” activa la barra en el diseño Cupos.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-4 sm:p-6">
            <h2 className="mb-4 font-azonix text-base text-white">Logo del evento</h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Se dibuja arriba a la derecha en todos los flyers. Podés poner una ruta (por ejemplo /gamejamplus-logo.png) o subir una imagen.
            </p>
            <div className="space-y-4">
              <Field
                label="Ruta o imagen"
                value={data.eventLogo.startsWith("data:") ? "(imagen subida)" : data.eventLogo}
                placeholder="Vacío = sin logo"
                onChange={(v) => setData({ ...data, eventLogo: v })}
                hidden={hidden.eventLogo}
                onToggle={() => toggleHidden("eventLogo")}
              />
              <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-white/10 px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-white">
                <Upload className="h-4 w-4" /> Subir logo del evento
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => uploadEventLogo(e.target.files?.[0])}
                />
              </label>
            </div>
          </section>

          <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-azonix text-base text-white">Patrocinadores</h2>
              <EyeToggle hidden={hidden.sponsors} onToggle={() => toggleHidden("sponsors")} />
            </div>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Logos del pie del flyer, en orden de izquierda a derecha. Máximo {MAX_SPONSORS}.
            </p>
            <div className="space-y-3">
              {data.sponsors.map((s, i) => (
                <div key={`${s.name}-${i}`} className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt="" className="h-11 w-14 shrink-0 rounded-md border border-white/10 bg-black/30 object-contain p-1" />
                  <input
                    aria-label={`Nombre del patrocinador ${i + 1}`}
                    value={s.name}
                    onChange={(e) => renameSponsor(i, e.target.value)}
                    className="min-h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-base text-white outline-none focus:border-[var(--gamer-purple)] sm:min-h-0 sm:text-sm"
                  />
                  <IconButton label="Quitar patrocinador" onClick={() => removeSponsor(i)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              ))}
            </div>
            {data.sponsors.length < MAX_SPONSORS ? (
              <label className="mt-4 flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-white/15 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white">
                <Plus className="h-4 w-4" /> Agregar logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    addSponsor(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            ) : (
              <p className="mt-4 text-xs text-[var(--muted)]">Llegaste al máximo de {MAX_SPONSORS} patrocinadores.</p>
            )}
          </section>
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

function readAsDataUrl(file: File, done: (src: string) => void) {
  const reader = new FileReader();
  reader.onload = () => done(String(reader.result));
  reader.readAsDataURL(file);
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "logo";
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
          className="min-h-11 rounded-md border px-3 py-2 text-base transition-colors sm:min-h-0 sm:text-sm"
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

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-white/5 hover:text-white sm:h-8 sm:w-8"
    >
      {children}
    </button>
  );
}

function EyeToggle({ hidden, onToggle }: { hidden?: boolean; onToggle: () => void }) {
  const Icon = hidden ? EyeOff : Eye;
  const label = hidden ? "Mostrar en el flyer" : "Ocultar del flyer";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={hidden === true}
      title={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-white/5 hover:text-white sm:h-8 sm:w-8"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hidden,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hidden?: boolean;
  onToggle?: () => void;
}) {
  const id = useId();
  const className =
    "min-h-11 w-full rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-base text-white outline-none focus:border-[var(--gamer-purple)] disabled:opacity-40 sm:min-h-0 sm:text-sm";
  // The label is only the text and the input. The eye button sits beside them, not inside the label,
  // so its click area is its own and clicks on the label do not toggle anything.
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={id} className="text-xs uppercase tracking-wider text-[var(--muted)]">
          {label}
        </label>
        {onToggle && <EyeToggle hidden={hidden} onToggle={onToggle} />}
      </div>
      <input
        id={id}
        className={className}
        value={value}
        placeholder={placeholder}
        disabled={hidden}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

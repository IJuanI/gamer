"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, Suspense, type ReactNode } from "react";
import { createPortal, flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowLeftRight, ArrowUp, Download, Eye, EyeOff, Pause, Play, Plus, Trash2, Upload } from "lucide-react";
import { Role } from "@gamer/shared";
import { useAuth } from "@/components/auth-provider";
import { PanelLoop, StoryPlayer, type SharedLogos } from "@/components/flyers/story-player";
import { FLYER_BRAND_LIST, FLYER_BRANDS, type FlyerBrand } from "@/lib/flyer-brands";
import { FLYER_FORMATS } from "@/lib/flyer-formats";
import { decodeAudioFile, findBeats, type BeatAnalysis } from "@/lib/audio-beats";
import { exportStoryVideo, videoExportSupported } from "@/lib/export-video";
import {
  CONTENT_OPTIONS,
  DEFAULT_STORY,
  EFFECTS,
  ENTRANCES,
  MIN_PANEL_MS,
  REVEALS,
  buildTimeline,
  newPanel,
  type ContentId,
  type EffectId,
  type EntranceId,
  type RevealId,
  type StoryConfig,
  type PanelText,
  type StoryPanel,
  type TransitionFx,
} from "@/lib/story-model";
import {
  CLASSIC_TRANSITIONS,
  DIRECTIONAL,
  DIRECTIONS,
  defaultDirection,
  OVERLAY_TRANSITIONS,
  STRENGTH_TRANSITIONS,
  TRANSITIONS,
  type Direction,
  type TransitionId,
} from "@/lib/story-transitions";
import { BACKGROUNDS, FLYER_DEFAULTS, MAX_SPONSORS, type FlyerBackground, type FlyerFieldKey, type VenueData, type VenueMode } from "@/lib/flyer-kinds";
import { useFitWidth } from "@/lib/use-fit-width";

export const dynamic = "force-dynamic";

const PLAYER_WIDTH = 340;
const FORMAT = FLYER_FORMATS["instagram-story"];
/** Frames per second in the downloaded video. 30 keeps the export time reasonable. */
const EXPORT_FPS = 30;
/** Largest offset the slider can go negative to. */
const OFFSET_MIN_MS = -10000;
const WAVE_BINS = 600;
const WAVE_HEIGHT = 96;
/** Side-by-side preview needs room for the preview and a usable editor next to it. */
/** Floating preview beside a panel card: width, height at the 9:16 ratio, gap to the card, and margin to the viewport edge. */
const FLOAT_WIDTH = 200;
const FLOAT_HEIGHT = Math.round((FLOAT_WIDTH * 1920) / 1080);
const FLOAT_GAP = 16;
const FLOAT_MARGIN = 12;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface FloatInfo {
  side: "left" | "right";
  /** Page y of the card's top edge, where the preview wants to start. */
  top: number;
  height: number;
}

/**
 * Page y for each floating preview. Previews on the same side are sorted by their wanted position,
 * and any that would overlap the one above is pushed down just below it.
 */
function stackTops(floats: Record<string, FloatInfo>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const side of ["left", "right"] as const) {
    const items = Object.entries(floats)
      .filter(([, f]) => f.side === side)
      .sort((a, b) => a[1].top - b[1].top);
    let bottom = -Infinity;
    for (const [id, f] of items) {
      const top = Math.max(f.top, bottom + FLOAT_GAP);
      out[id] = top;
      bottom = top + f.height;
    }
  }
  return out;
}

function StoryContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [config, setConfig] = useState<StoryConfig>(DEFAULT_STORY);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BeatAnalysis | null>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [trackMs, setTrackMs] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [compact, setCompact] = useState(false);
  const [exportT, setExportT] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [playerRef, playerWidth] = useFitWidth<HTMLDivElement>(PLAYER_WIDTH);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && user.role !== Role.EDITOR && user.role !== Role.ADMIN) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  // Load the default track once on mount. It starts at 44.5 s (set in DEFAULT_STORY).
  useEffect(() => {
    let cancelled = false;
    fetch("/story/default-music.mp4")
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (blob && !cancelled) void handleAudio(new File([blob], "default-music.mp4", { type: "video/mp4" }));
      })
      .catch(() => {
        // No default track. The user can still pick one.
      });
    return () => {
      cancelled = true;
    };
    // Runs once on mount.
  }, []);

  // The music offset moves the beats too: a beat at track time b sits at timeline time b - offset.
  const beats = useMemo(
    () => (analysis?.beats ?? []).map((b) => b - config.musicOffsetMs / 1000).filter((b) => b >= 0),
    [analysis, config.musicOffsetMs],
  );
  const timeline = useMemo(() => buildTimeline(config, beats), [config, beats]);
  const onEnded = useCallback(() => setPlaying(false), []);
  // Timeline time of the playhead while playing. Null when stopped, so the offset marker sits at the start.
  const [lastPlayMs, setPlayMs] = useState<number | null>(null);
  const playMs = playing ? lastPlayMs : null;
  const onTime = useCallback((ms: number) => setPlayMs(ms), []);

  // Space plays and stops the whole video. Typing fields keep their space key.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== "Space" || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (exporting || config.panels.length === 0) return;
      e.preventDefault();
      // A focused button would also fire on space. Drop focus so only the playback toggles.
      if (el && el.tagName === "BUTTON") el.blur();
      setPlaying((p) => !p);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exporting, config.panels.length]);

  // Floating previews report where they want to sit. The page then stacks them so none overlap.
  const [floats, setFloats] = useState<Record<string, FloatInfo>>({});
  const reportFloat = useCallback((id: string, info: FloatInfo | null) => {
    setFloats((prev) => {
      if (info === null) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      const cur = prev[id];
      if (cur && cur.side === info.side && cur.top === info.top && cur.height === info.height) return prev;
      return { ...prev, [id]: info };
    });
  }, []);
  const floatTops = useMemo(() => stackTops(floats), [floats]);

  if (loading || !user || (user.role !== Role.EDITOR && user.role !== Role.ADMIN)) {
    return (
      <main className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Cargando…
      </main>
    );
  }

  function update(patch: Partial<StoryConfig>) {
    setPlaying(false);
    setConfig((c) => ({ ...c, ...patch }));
  }

  function updatePanel(id: string, patch: Partial<StoryPanel>) {
    setPlaying(false);
    setConfig((c) => ({ ...c, panels: c.panels.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }

  function movePanel(index: number, dir: -1 | 1) {
    setPlaying(false);
    setConfig((c) => {
      const panels = [...c.panels];
      const target = index + dir;
      if (target < 0 || target >= panels.length) return c;
      [panels[index], panels[target]] = [panels[target], panels[index]];
      return { ...c, panels };
    });
  }

  function removePanel(id: string) {
    setPlaying(false);
    setConfig((c) => ({ ...c, panels: c.panels.filter((p) => p.id !== id) }));
  }

  function addPanel() {
    setPlaying(false);
    setConfig((c) => ({ ...c, panels: [...c.panels, newPanel("evento")] }));
  }

  function togglePanelEffect(id: string, effect: EffectId) {
    setConfig((c) => ({
      ...c,
      panels: c.panels.map((p) =>
        p.id === id ? { ...p, effects: p.effects.includes(effect) ? p.effects.filter((e) => e !== effect) : [...p.effects, effect] } : p,
      ),
    }));
  }

  async function handleAudio(file: File | undefined) {
    if (!file) return;
    setPlaying(false);
    setAudioError(null);
    setAnalyzing(true);
    setAnalysis(null);
    setPeaks(null);
    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    try {
      const { samples, sampleRate } = await decodeAudioFile(file);
      setAnalysis(findBeats(samples, sampleRate));
      setPeaks(waveformPeaks(samples, WAVE_BINS));
      setTrackMs((samples.length / sampleRate) * 1000);
    } catch {
      setAudioError("No se pudo leer el audio. Probá con MP3, WAV, OGG, M4A o MP4 (audio AAC).");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDownload() {
    if (!videoExportSupported()) {
      setExportError("Este navegador no puede exportar video. Probá con Chrome o Edge en computadora.");
      return;
    }
    setPlaying(false);
    setExporting(true);
    setExportError(null);
    setExportProgress(0);
    try {
      const blob = await exportStoryVideo({
        totalMs: timeline.total,
        fps: EXPORT_FPS,
        width: FORMAT.width,
        height: FORMAT.height,
        audio: audioFile ? { file: audioFile, offsetMs: config.musicOffsetMs } : undefined,
        renderAt: async (tMs) => {
          // Render the exact frame through the player, then capture the unscaled stage.
          flushSync(() => setExportT(tMs));
          await waitFrames(2);
          const node = stageRef.current?.querySelector<HTMLElement>("[data-story-stage]");
          if (!node) throw new Error("No se encontró el escenario para exportar.");
          return node;
        },
        onProgress: (done, total) => setExportProgress(done / total),
      });
      downloadBlob(blob, `story-${config.brand}-${EXPORT_FPS}fps.webm`);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "No se pudo exportar el video.");
    } finally {
      setExportT(null);
      setExporting(false);
    }
  }

  const beatStatus = analysis
    ? analysis.beats.length >= 4
      ? `${analysis.bpm || "?"} BPM · ${analysis.beats.length} beats detectados`
      : "Pocos beats detectados: se usan las duraciones de cada panel"
    : "Sin audio: cada panel dura lo que indica su duración";

  const totalSeconds = Math.round(timeline.total / 100) / 10;

  return (
    <>
      <header className="relative border-b border-white/5 bg-[#12121E]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/admin/flyers" className="flex min-h-11 items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Flyers
          </Link>
          <h1 className="font-azonix text-base text-white sm:text-lg">Story en video</h1>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 sm:py-12 lg:grid-cols-[340px_1fr] lg:gap-8">
        <div ref={playerRef} className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-sm text-[var(--muted)]">
            Vista previa — {FLYER_BRANDS[config.brand].name} · {config.panels.length} paneles · {totalSeconds}s
            {config.repeat && " · en loop"}
          </p>
          <div ref={stageRef}>
            <StoryPlayer
              config={config}
              timeline={timeline}
              audioUrl={audioUrl}
              playing={playing}
              width={playerWidth || PLAYER_WIDTH}
              onEnded={onEnded}
              onTime={onTime}
              frozenT={exportT}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setPlaying((p) => !p)}
              disabled={config.panels.length === 0 || exporting}
              className="flex min-h-11 items-center gap-2 rounded-md px-5 py-3 font-medium text-white transition-transform hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: "var(--gamer-purple)" }}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Detener" : "Reproducir"}
            </button>
            <span className="hidden self-center text-xs text-[var(--muted)] sm:inline">Espacio: reproducir / detener</span>
            <button
              onClick={() => void handleDownload()}
              disabled={config.panels.length === 0 || exporting || playing}
              className="flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-5 py-3 font-medium text-white hover:bg-white/5 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? `Exportando… ${Math.round(exportProgress * 100)}%` : "Descargar video"}
            </button>
          </div>
          {exporting && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={Math.round(exportProgress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full transition-[width]" style={{ width: `${exportProgress * 100}%`, backgroundColor: "var(--gamer-purple)" }} />
            </div>
          )}
          {exportError && <p className="mt-3 text-sm text-red-400">{exportError}</p>}
          <p className="mt-3 text-xs text-[var(--muted)]">
            Video WebM (VP9 + Opus), {EXPORT_FPS} fps, {FORMAT.width}×{FORMAT.height}. Cada cuadro se renderiza en el navegador, así que un video largo tarda más. Los efectos y las entradas quedan iguales a la vista previa.
          </p>
        </div>

        <div className="min-w-0 space-y-6">
          <Section title="Marca">
            <Chips
              options={FLYER_BRAND_LIST.map((b) => ({ id: b.id, label: b.name }))}
              value={config.brand}
              onChange={(id) => update({ brand: id as FlyerBrand })}
            />
          </Section>

          <Section title="Paneles">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--muted)]">
                Cada panel muestra un contenido y tiene sus propios efectos. Los bloques entran según la aparición elegida, como si los presentaras.
              </p>
              <button
                type="button"
                aria-pressed={compact}
                onClick={() => setCompact((c) => !c)}
                className="min-h-11 rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white sm:min-h-0"
              >
                {compact ? "Vista detallada" : "Vista compacta"}
              </button>
            </div>
            <div className="space-y-3">
              {config.panels.map((p, i) => (
                <Fragment key={p.id}>
                  {config.advancedTransitions && i > 0 && (
                    <TransitionBetween
                      index={i}
                      fx={p.transitionFx ?? { type: config.transition, strength: 1 }}
                      onChange={(fx) => updatePanel(p.id, { transitionFx: fx })}
                    />
                  )}
                  <PanelCard
                    brand={config.brand}
                    logos={config}
                    index={i}
                    panel={p}
                    total={config.panels.length}
                    compact={compact}
                    onChange={(patch) => updatePanel(p.id, patch)}
                    onToggleEffect={(effect) => togglePanelEffect(p.id, effect)}
                    onMove={(dir) => movePanel(i, dir)}
                    onRemove={() => removePanel(p.id)}
                    onFloat={reportFloat}
                    floatTop={floatTops[p.id]}
                  />
                </Fragment>
              ))}
            </div>
            <button
              onClick={addPanel}
              className="mt-4 flex min-h-11 items-center gap-2 rounded-md border border-dashed border-white/15 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white"
            >
              <Plus className="h-4 w-4" /> Agregar panel
            </button>
          </Section>

          <Section title="Logos y patrocinadores">
            <p className="mb-4 text-sm text-[var(--muted)]">
              Se usan en todos los paneles. Cada panel puede ocultarlos con el ojo de su tarjeta.
            </p>
            <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Logo del evento</p>
            <input
              value={config.eventLogo ?? FLYER_DEFAULTS[config.brand].eventLogo}
              onChange={(e) => update({ eventLogo: e.target.value })}
              placeholder="Ruta o imagen. Vacío = sin logo"
              aria-label="Logo del evento"
              className="min-h-11 w-full rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-base text-white outline-none placeholder:text-white/30 focus:border-[var(--gamer-purple)] sm:text-sm"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white sm:min-h-0">
                <Upload className="h-4 w-4" /> Subir logo del evento
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) readFileAsDataUrl(file, (src) => update({ eventLogo: src }));
                  }}
                />
              </label>
            </div>

            <p className="mb-2 mt-6 text-xs uppercase tracking-wider text-[var(--muted)]">Patrocinadores</p>
            <div className="space-y-2">
              {(config.sponsors ?? FLYER_DEFAULTS[config.brand].sponsors).map((s, i, all) => (
                <div key={`${i}-${s.name}`} className="flex items-center gap-2">
                  <input
                    value={s.name}
                    aria-label={`Nombre del patrocinador ${i + 1}`}
                    onChange={(e) => update({ sponsors: all.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })}
                    className="min-h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-base text-white outline-none focus:border-[var(--gamer-purple)] sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => update({ sponsors: all.filter((_, j) => j !== i) })}
                    className="min-h-11 rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white sm:min-h-0"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
            {(config.sponsors ?? FLYER_DEFAULTS[config.brand].sponsors).length < MAX_SPONSORS && (
              <label className="mt-3 flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-white/15 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white sm:min-h-0">
                <Plus className="h-4 w-4" /> Agregar patrocinador
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const current = config.sponsors ?? FLYER_DEFAULTS[config.brand].sponsors;
                    const name = file.name.replace(/\.[^.]+$/, "") || `Patrocinador ${current.length + 1}`;
                    readFileAsDataUrl(file, (src) => update({ sponsors: [...current, { name, src }] }));
                  }}
                />
              </label>
            )}
            <button
              type="button"
              onClick={() => update({ eventLogo: undefined, sponsors: undefined })}
              className="mt-4 min-h-11 rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white sm:min-h-0"
            >
              Volver a los de la marca
            </button>
          </Section>

          <Section title="Transiciones">
            <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                aria-pressed={config.advancedTransitions}
                onClick={() => update({ advancedTransitions: !config.advancedTransitions })}
                className="min-h-11 rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white sm:min-h-0"
              >
                {config.advancedTransitions ? "Modo simple" : "Modo avanzado"}
              </button>
            </div>
            {config.advancedTransitions ? (
              <p className="text-sm text-[var(--muted)]">
                Cada transición se elige entre dos paneles, en la lista de arriba. Cada una tiene sus propias opciones.
              </p>
            ) : (
              <>
                <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Clásicas · una panel sale antes de que entre la otra</p>
                <Chips
                  options={(Object.keys(CLASSIC_TRANSITIONS) as TransitionId[]).map((id) => ({ id, label: TRANSITIONS[id].label }))}
                  value={config.transition}
                  onChange={(id) => update({ transition: id as TransitionId })}
                />
                <p className="mb-2 mt-5 text-xs uppercase tracking-wider text-[var(--muted)]">Superposición · las dos panels se ven a la vez</p>
                <Chips
                  options={(Object.keys(OVERLAY_TRANSITIONS) as TransitionId[]).map((id) => ({ id, label: TRANSITIONS[id].label }))}
                  value={config.transition}
                  onChange={(id) => update({ transition: id as TransitionId })}
                />
                <p className="mt-3 text-sm text-[var(--muted)]">{TRANSITIONS[config.transition].hint}</p>
              </>
            )}
          </Section>

          <Section title="Repetir">
            <label className="flex min-h-11 items-center gap-3 text-sm text-[var(--text-secondary)]">
              <input type="checkbox" className="h-5 w-5" checked={config.repeat} onChange={(e) => update({ repeat: e.target.checked })} />
              Repetir la secuencia de paneles
            </label>
            {config.repeat && (
              <div className="mt-4">
                <Slider
                  label={`Duración total · ${Math.round(config.repeatUntilMs / 1000)} s`}
                  min={MIN_PANEL_MS * 10}
                  max={120000}
                  step={1000}
                  value={config.repeatUntilMs}
                  onChange={(v) => update({ repeatUntilMs: v })}
                />
              </div>
            )}
            <label className="mt-4 flex min-h-11 items-center gap-3 text-sm text-[var(--text-secondary)]">
              <input type="checkbox" className="h-5 w-5" checked={config.holdLast} onChange={(e) => update({ holdLast: e.target.checked })} />
              Congelar en el último panel al terminar
            </label>
            {config.holdLast && (
              <div className="mt-4">
                <Slider
                  label={`Tiempo congelado · ${(config.holdMs / 1000).toFixed(1)} s`}
                  min={500}
                  max={30000}
                  step={500}
                  value={config.holdMs}
                  onChange={(v) => update({ holdMs: v })}
                />
              </div>
            )}
          </Section>

          <Section title="Música">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-white/10 px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-white">
              <Upload className="h-4 w-4" />
              {analyzing ? "Analizando audio…" : "Elegir archivo de audio (MP3, WAV, OGG, M4A, MP4)"}
              <input type="file" accept="audio/*,video/mp4,.m4a,.mp4,.mp3,.wav,.ogg" className="hidden" onChange={(e) => void handleAudio(e.target.files?.[0])} />
            </label>
            <p className="mt-3 text-sm text-[var(--muted)]">{audioError ?? beatStatus}</p>

            {peaks && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Desfase con la música</p>
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    disabled={config.panels.length === 0 || exporting}
                    className="flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50 sm:min-h-0"
                  >
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {playing ? "Detener" : "Reproducir"}
                  </button>
                </div>
                <MusicOffset
                  peaks={peaks}
                  trackMs={trackMs}
                  offsetMs={config.musicOffsetMs}
                  totalMs={timeline.total}
                  playheadMs={playMs}
                  onChange={(ms) => update({ musicOffsetMs: ms })}
                />
                <Slider
                  label={`Desfase · ${offsetCopy(config.musicOffsetMs)}`}
                  min={OFFSET_MIN_MS}
                  max={Math.max(trackMs, 1000)}
                  step={100}
                  value={config.musicOffsetMs}
                  onChange={(v) => update({ musicOffsetMs: v })}
                />
                <button
                  type="button"
                  onClick={() => update({ musicOffsetMs: 0 })}
                  disabled={config.musicOffsetMs === 0}
                  className="min-h-11 rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white disabled:opacity-40 sm:min-h-0"
                >
                  Volver a 0
                </button>
              </div>
            )}

            <label className="mt-5 flex min-h-11 items-center gap-3 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={config.snapToBeats}
                disabled={!analysis}
                onChange={(e) => update({ snapToBeats: e.target.checked })}
              />
              Ajustar el corte de cada panel al beat más cercano
            </label>
          </Section>
        </div>
      </div>
    </>
  );
}

export default function AdminStoryPage() {
  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid-neon-fade" />
      <Suspense fallback={null}>
        <StoryContent />
      </Suspense>
    </main>
  );
}

/** Text fields a panel can override, with their labels. */
const PANEL_TEXT_FIELDS: [Exclude<keyof PanelText, "venue">, string][] = [
  ["eyebrow", "Etiqueta"],
  ["title", "Título"],
  ["subtitle", "Subtítulo"],
  ["dateText", "Fecha"],
];

/** Which flyer component each panel text field controls, for the eye toggle. */
const HIDDEN_KEY: Record<Exclude<keyof PanelText, "venue">, FlyerFieldKey> = {
  eyebrow: "eyebrow",
  title: "title",
  subtitle: "subtitle",
  dateText: "date",
  city: "city",
};

function EyeButton({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) {
  const Icon = hidden ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={hidden ? "Mostrar" : "Ocultar"}
      className="rounded p-1 text-white/50 hover:text-white"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/** Flyer blocks a panel can hide, with the same keys as the flyer page. */
const SHARED_TOGGLES: [FlyerFieldKey, string][] = [
  ["eventLogo", "Logo del evento"],
  ["sponsors", "Patrocinadores"],
];

/** Sidebar section with a fixed header. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel-clip border border-white/8 bg-[var(--background-elevated)] p-4 sm:p-6">
      <h2 className="mb-4 font-azonix text-base text-white">{title}</h2>
      {children}
    </section>
  );
}

/** Collapsible part of a panel card. Closed unless defaultOpen is set. */
function Fold({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="group rounded-md border border-white/10 px-3 py-2">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xs uppercase tracking-wider text-[var(--muted)] hover:text-white">
        {title}
        <span aria-hidden="true" className="transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

/** Venue choices for a panel. Same options as the flyer page. */
const VENUE_OPTIONS: { id: VenueMode; label: string }[] = [
  { id: "mirador", label: "MiradorTEC" },
  { id: "text", label: "Texto libre" },
  { id: "logo", label: "Subir logo" },
];

function readFileAsDataUrl(file: File, done: (src: string) => void) {
  const reader = new FileReader();
  reader.onload = () => done(String(reader.result));
  reader.readAsDataURL(file);
}

function PanelCard({
  brand,
  logos,
  index,
  panel,
  total,
  compact,
  onChange,
  onToggleEffect,
  onMove,
  onRemove,
  onFloat,
  floatTop,
}: {
  brand: FlyerBrand;
  logos: SharedLogos;
  index: number;
  panel: StoryPanel;
  total: number;
  compact: boolean;
  onChange: (patch: Partial<StoryPanel>) => void;
  onToggleEffect: (effect: EffectId) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onFloat: (id: string, info: FloatInfo | null) => void;
  /** Viewport y after stacking, or undefined before the page has reported this preview. */
  floatTop: number | undefined;
}) {
  const venue: VenueData = panel.text?.venue ?? FLYER_DEFAULTS[brand].venue;
  const setVenue = (patch: Partial<VenueData>) =>
    onChange({ text: { ...panel.text, venue: { ...venue, ...patch } } });
  const isHidden = (k: FlyerFieldKey) => !!panel.hidden?.[k];
  const toggleHidden = (k: FlyerFieldKey) => onChange({ hidden: { ...panel.hidden, [k]: !panel.hidden?.[k] } });

  // Each panel keeps its own preview state. Hidden by default.
  const [showPreview, setShowPreview] = useState(false);
  const [previewSide, setPreviewSide] = useState<"left" | "right">("right");
  const [cardRef, cardWidth] = useFitWidth<HTMLDivElement>(900);
  // Where the preview goes: beside the card in free space (outside it), or stacked inside when no side fits.
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!showPreview || !el) return;
    const measure = () => setAnchor(el.getBoundingClientRect());
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [showPreview, cardRef, cardWidth]);

  const vw = typeof window === "undefined" ? 0 : window.innerWidth;
  const vh = typeof window === "undefined" ? 0 : window.innerHeight;
  const fitsRight = anchor !== null && vw - anchor.right - FLOAT_GAP - FLOAT_MARGIN >= FLOAT_WIDTH;
  const fitsLeft = anchor !== null && anchor.left - FLOAT_GAP - FLOAT_MARGIN >= FLOAT_WIDTH;
  const side: "left" | "right" | null =
    previewSide === "right"
      ? fitsRight ? "right" : fitsLeft ? "left" : null
      : fitsLeft ? "left" : fitsRight ? "right" : null;
  // The card scrolled out of view: hide the floating preview rather than leave it pinned to nothing.
  const cardVisible = anchor !== null && anchor.bottom > 0 && anchor.top < vh;
  const floating = showPreview && side !== null && cardVisible;
  const stackedWidth = clamp(cardWidth, 160, 280);
  // Where this preview wants to start: beside the card, kept inside the viewport.
  const wantTop = anchor ? clamp(anchor.top, FLOAT_MARGIN, vh - FLOAT_HEIGHT - FLOAT_MARGIN) : 0;

  // Report to the page so it can stack this preview clear of the others. Withdraw when not floating.
  useEffect(() => {
    if (!floating || side === null) {
      onFloat(panel.id, null);
      return;
    }
    onFloat(panel.id, { side, top: wantTop, height: FLOAT_HEIGHT });
  }, [floating, side, wantTop, panel.id, onFloat]);
  useEffect(() => () => onFloat(panel.id, null), [panel.id, onFloat]);

  const loop = (width: number) => <PanelLoop brand={brand} logos={logos} panel={panel} width={width} />;

  // Stacked below its neighbours. If that pushes it off the bottom of the viewport, it is not shown.
  const placed = floatTop !== undefined && floatTop + FLOAT_HEIGHT <= vh - FLOAT_MARGIN;
  const floatingPreview =
    floating && placed && anchor && side && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed z-40"
            style={{
              width: FLOAT_WIDTH,
              top: floatTop,
              left: side === "right" ? anchor.right + FLOAT_GAP : anchor.left - FLOAT_GAP - FLOAT_WIDTH,
            }}
          >
            {loop(FLOAT_WIDTH)}
          </div>,
          document.body,
        )
      : null;

  // Every option is in both views. Compact only packs them into two columns and drops the gaps.
  const options = (
    <div className={compact ? "grid min-w-0 flex-1 gap-x-4 gap-y-4 sm:grid-cols-2" : "min-w-0 flex-1 space-y-4"}>
      <Slider
        label={`Duración · ${(panel.durationMs / 1000).toFixed(1)} s`}
        min={MIN_PANEL_MS}
        max={10000}
        step={100}
        value={panel.durationMs}
        onChange={(v) => onChange({ durationMs: v })}
      />

      <Slider
        label={`Velocidad de la transición · ${panel.transitionMs} ms`}
        min={150}
        max={1500}
        step={50}
        value={panel.transitionMs}
        onChange={(v) => onChange({ transitionMs: v })}
      />

      <Fold title="Fondo de este panel">
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Fondo de este panel</p>
        <Chips
          options={[
            { id: "marca", label: "Marca" },
            ...(Object.keys(BACKGROUNDS) as FlyerBackground[]).map((id) => ({ id, label: BACKGROUNDS[id].label })),
          ]}
          value={panel.background ?? "marca"}
          onChange={(id) => onChange({ background: id === "marca" ? undefined : (id as FlyerBackground) })}
        />
      </div>

      </Fold>

      <Fold title="Animación">
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Entrada de cada bloque</p>
        <Chips
          options={(Object.keys(ENTRANCES) as EntranceId[]).map((id) => ({ id, label: ENTRANCES[id].label }))}
          value={panel.entrance}
          onChange={(id) => onChange({ entrance: id as EntranceId })}
        />
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Aparición</p>
        <Chips
          options={(Object.keys(REVEALS) as RevealId[]).map((id) => ({ id, label: REVEALS[id].label }))}
          value={panel.reveal}
          onChange={(id) => onChange({ reveal: id as RevealId })}
        />
        <p className="mt-2 text-xs text-[var(--muted)]">{REVEALS[panel.reveal].hint}</p>
        {panel.reveal !== "todo" && (
          <div className="mt-3">
            <Slider
              label={`Intervalo entre bloques · ${panel.revealStepMs} ms`}
              min={100}
              max={1200}
              step={50}
              value={panel.revealStepMs}
              onChange={(v) => onChange({ revealStepMs: v })}
            />
          </div>
        )}
      </div>

      </Fold>

      <div className={compact ? "sm:col-span-2" : undefined}>
        <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Textos de este panel</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PANEL_TEXT_FIELDS.map(([key, label]) => (
            <label key={key} className="block text-xs text-[var(--muted)]">
              <span className="mb-1 flex items-center justify-between">
                {label}
                <EyeButton hidden={isHidden(HIDDEN_KEY[key])} onToggle={() => toggleHidden(HIDDEN_KEY[key])} />
              </span>
              <input
                value={panel.text?.[key] ?? ""}
                placeholder={FLYER_DEFAULTS[brand][key]}
                onChange={(e) => onChange({ text: { ...panel.text, [key]: e.target.value } })}
                className="mt-1 min-h-11 w-full rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-base text-white outline-none placeholder:text-white/30 focus:border-[var(--gamer-purple)] sm:text-sm"
              />
            </label>
          ))}
        </div>
        <Fold title="Logo, patrocinadores y lugar">
        <div className="mt-3">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">Mostrar en este panel</span>
          <div className="flex flex-wrap gap-2">
            {SHARED_TOGGLES.map(([key, label]) => (
              <span key={key} className="flex min-h-11 items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-[var(--text-secondary)] sm:min-h-0">
                {label}
                <EyeButton hidden={isHidden(key)} onToggle={() => toggleHidden(key)} />
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <span className="mb-1 flex items-center justify-between text-xs uppercase tracking-wider text-[var(--muted)]">
            Lugar
            <EyeButton hidden={isHidden("venue")} onToggle={() => toggleHidden("venue")} />
          </span>
          <Chips
            options={VENUE_OPTIONS}
            value={venue.mode}
            onChange={(id) => setVenue({ mode: id as VenueMode })}
          />
          {venue.mode === "text" && (
            <input
              value={venue.text}
              onChange={(e) => setVenue({ text: e.target.value })}
              placeholder="Texto del lugar"
              className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-base text-white outline-none placeholder:text-white/30 focus:border-[var(--gamer-purple)] sm:text-sm"
            />
          )}
          {venue.mode === "logo" && (
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) readFileAsDataUrl(file, (src) => setVenue({ mode: "logo", logoSrc: src }));
              }}
              className="mt-2 text-base text-[var(--text-secondary)] sm:text-sm"
            />
          )}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">Vacío usa el texto de la marca (en gris).</p>
        <label className="mt-3 block text-xs text-[var(--muted)]">
          <span className="mb-1 flex items-center justify-between">
            Ciudad
            <EyeButton hidden={isHidden("city")} onToggle={() => toggleHidden("city")} />
          </span>
          <input
            value={panel.text?.city ?? ""}
            placeholder={FLYER_DEFAULTS[brand].city}
            onChange={(e) => onChange({ text: { ...panel.text, city: e.target.value } })}
            className="mt-1 min-h-11 w-full rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-base text-white outline-none placeholder:text-white/30 focus:border-[var(--gamer-purple)] sm:text-sm"
          />
        </label>
        </Fold>
      </div>

      <Fold title="Efectos de este panel">
        <MultiChips
          options={(Object.keys(EFFECTS) as EffectId[]).map((id) => ({ id, label: EFFECTS[id].label, hint: EFFECTS[id].hint }))}
          selected={panel.effects}
          onToggle={(id) => onToggleEffect(id as EffectId)}
        />
      </Fold>
    </div>
  );

  return (
    <div ref={cardRef} className="space-y-4 rounded-md border border-white/10 p-3 sm:p-4">
      {/* Header and toggle never move: the preview only appears below them. */}
      <div className="flex items-center gap-2">
        <span className="font-azonix text-xs text-[var(--muted)]">{index + 1}</span>
        <select
          value={panel.content}
          onChange={(e) => onChange({ content: e.target.value as ContentId })}
          aria-label="Contenido del panel"
          className="min-h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-[#0e0e18] px-3 py-2 text-base text-white outline-none focus:border-[var(--gamer-purple)] sm:text-sm"
        >
          {(Object.keys(CONTENT_OPTIONS) as ContentId[]).map((id) => (
            <option key={id} value={id}>
              {CONTENT_OPTIONS[id].label}
            </option>
          ))}
        </select>
        <IconButton label="Subir panel" disabled={index === 0} onClick={() => onMove(-1)}>
          <ArrowUp className="h-4 w-4" />
        </IconButton>
        <IconButton label="Bajar panel" disabled={index === total - 1} onClick={() => onMove(1)}>
          <ArrowDown className="h-4 w-4" />
        </IconButton>
        <IconButton label="Quitar panel" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={showPreview}
          onClick={() => setShowPreview((s) => !s)}
          className="flex min-h-11 items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white sm:min-h-0"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreview ? "Ocultar vista previa" : "Ver vista previa"}
        </button>
        {showPreview && (
          <button
            type="button"
            onClick={() => setPreviewSide((s) => (s === "right" ? "left" : "right"))}
            className="flex min-h-11 items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white sm:min-h-0"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" /> Cambiar de lado
          </button>
        )}
      </div>

      {showPreview && side === null && <div className="w-full">{loop(stackedWidth)}</div>}
      {options}
      {floatingPreview}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-white/5 hover:text-white disabled:opacity-30 sm:h-8 sm:w-8"
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-h-6 w-full accent-[var(--gamer-purple)]"
      />
    </label>
  );
}

function chipStyle(on: boolean) {
  return on
    ? { borderColor: "var(--gamer-purple)", color: "var(--gamer-purple-text)", backgroundColor: "rgba(179,57,196,0.1)" }
    : { borderColor: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" };
}

const CHIP_CLASS = "min-h-11 rounded-md border px-3 py-2 text-base transition-colors sm:min-h-0 sm:text-sm";

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
        <button key={o.id} type="button" onClick={() => onChange(o.id)} className={CHIP_CLASS} style={chipStyle(o.id === value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function MultiChips({
  options,
  selected,
  onToggle,
}: {
  options: { id: string; label: string; hint?: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            title={o.hint}
            onClick={() => onToggle(o.id)}
            className={CHIP_CLASS}
            style={chipStyle(on)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Track waveform with the video window drawn on it. Click or drag to set where the video starts
 * in the song. The highlighted band is the part of the song the video will use.
 */
/** Advanced mode: the transition that runs between panel `index - 1` and panel `index`. */
function TransitionBetween({ index, fx, onChange }: { index: number; fx: TransitionFx; onChange: (fx: TransitionFx) => void }) {
  const dir = fx.direction ?? defaultDirection(fx.type);
  const options = [...Object.keys(CLASSIC_TRANSITIONS), ...Object.keys(OVERLAY_TRANSITIONS)] as TransitionId[];
  return (
    <div className="space-y-4 rounded-md border border-dashed border-[var(--gamer-purple)]/50 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
        Transición · del panel {index} al {index + 1}
      </p>
      <Chips
        options={options.map((id) => ({ id, label: TRANSITIONS[id].label }))}
        value={fx.type}
        onChange={(id) => onChange({ ...fx, type: id as TransitionId })}
      />
      <p className="text-sm text-[var(--muted)]">{TRANSITIONS[fx.type].hint}</p>
      {DIRECTIONAL.has(fx.type) && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Dirección</p>
          <Chips
            options={(Object.keys(DIRECTIONS) as Direction[]).map((id) => ({ id, label: DIRECTIONS[id].label }))}
            value={dir}
            onChange={(id) => onChange({ ...fx, direction: id as Direction })}
          />
        </div>
      )}
      {STRENGTH_TRANSITIONS.has(fx.type) && (
        <Slider
          label={`Intensidad · ${fx.strength.toFixed(1)}×`}
          min={0.5}
          max={2}
          step={0.1}
          value={fx.strength}
          onChange={(v) => onChange({ ...fx, strength: v })}
        />
      )}
    </div>
  );
}

function MusicOffset({
  peaks,
  trackMs,
  offsetMs,
  totalMs,
  playheadMs,
  onChange,
}: {
  peaks: number[];
  trackMs: number;
  offsetMs: number;
  totalMs: number;
  /** Timeline time while playing. Null when stopped. */
  playheadMs: number | null;
  onChange: (ms: number) => void;
}) {
  const [wrapRef, width] = useFitWidth<HTMLDivElement>(560);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || trackMs <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = WAVE_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, WAVE_HEIGHT);

    const toX = (ms: number) => (ms / trackMs) * width;
    const bandStart = clamp(offsetMs, 0, trackMs);
    const bandEnd = clamp(offsetMs + totalMs, 0, trackMs);
    ctx.fillStyle = "rgba(179,57,196,0.14)";
    ctx.fillRect(toX(bandStart), 0, Math.max(0, toX(bandEnd) - toX(bandStart)), WAVE_HEIGHT);

    const mid = WAVE_HEIGHT / 2;
    const barW = width / peaks.length;
    for (let i = 0; i < peaks.length; i++) {
      const inBand = i * barW >= toX(bandStart) && i * barW <= toX(bandEnd);
      ctx.fillStyle = inBand ? "rgba(224,190,255,0.85)" : "rgba(255,255,255,0.28)";
      const h = Math.max(1, peaks[i] * mid * 0.92);
      ctx.fillRect(i * barW, mid - h, Math.max(1, barW - 1), h * 2);
    }

    // The green marker is where the timeline is in the track: offset + timeline time.
    // Stopped, that is the offset itself, so it sits at the chosen start.
    const marker = offsetMs + (playheadMs ?? 0);
    if (marker >= 0 && marker <= trackMs) {
      ctx.fillStyle = "#3cff9e";
      ctx.fillRect(toX(marker) - 1, 0, 2, WAVE_HEIGHT);
    }
  }, [peaks, trackMs, offsetMs, totalMs, playheadMs, width]);

  function setFromPointer(clientX: number) {
    const canvas = canvasRef.current;
    if (!canvas || trackMs <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const ms = ((clientX - rect.left) / rect.width) * trackMs;
    onChange(Math.round(clamp(ms, 0, trackMs)));
  }

  return (
    <div ref={wrapRef} className="w-full">
      <canvas
        ref={canvasRef}
        aria-label="Forma de onda de la música. Tocá para elegir dónde empieza el video."
        className="block cursor-pointer rounded-md border border-white/10 bg-black/30"
        style={{ width: width || "100%", height: WAVE_HEIGHT, touchAction: "none" }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromPointer(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromPointer(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      />
      <p className="mt-2 text-xs text-[var(--muted)]">
        Tocá o arrastrá sobre la onda para elegir en qué segundo de la canción empieza el video. La parte resaltada es la que se usa.
      </p>
    </div>
  );
}

function offsetCopy(ms: number): string {
  if (ms === 0) return "sin desfase";
  const s = (Math.abs(ms) / 1000).toFixed(1);
  return ms > 0 ? `el video arranca en el segundo ${s} de la canción` : `la música arranca ${s} s después del inicio`;
}

/** Peak envelope of the track, normalised to 0..1, one value per bin. */
function waveformPeaks(samples: ArrayLike<number>, bins: number): number[] {
  const out = new Array<number>(bins).fill(0);
  const per = Math.max(1, Math.floor(samples.length / bins));
  let max = 0;
  for (let b = 0; b < bins; b++) {
    const start = b * per;
    const end = Math.min(samples.length, start + per);
    let m = 0;
    for (let i = start; i < end; i++) {
      const v = Math.abs(samples[i]);
      if (v > m) m = v;
    }
    out[b] = m;
    if (m > max) max = m;
  }
  return max > 0 ? out.map((v) => v / max) : out;
}

function waitFrames(n: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0) return resolve();
      requestAnimationFrame(() => step(left - 1));
    };
    step(n);
  });
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

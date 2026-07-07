"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  SAMPLE_EVENTS,
  cloneEventForEditing,
  getGameDisplayNames,
  type EventData,
  type GameDetail,
} from "@/lib/event-data";
import { generateVariation, DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import {
  resolveBanner,
  TEMPLATE_LABELS,
  FORMAT_LABELS,
  type Template,
  type Format,
} from "@/lib/banner-registry";
import { exportSequenceMp4 } from "@/lib/export-sequence";

type AnimStyle = "glitch" | "scan" | "pulse" | "drift" | "matrix" | "none";

const ANIM_OPTIONS: { id: AnimStyle; label: string }[] = [
  { id: "none", label: "Sin animación" },
  { id: "pulse", label: "💜 Pulse" },
  { id: "glitch", label: "⚡ Glitch" },
  { id: "scan", label: "📡 Scan" },
  { id: "drift", label: "🌊 Drift" },
  { id: "matrix", label: "🟢 Matrix" },
];

interface Clip {
  id: string;
  template: Template;
  gameKey: string;
  days: number;
  animation: AnimStyle;
  durationSec: number;
  variation: BannerVariation;
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function makeClip(template: Template, randomize = false, id?: string): Clip {
  return {
    id: id ?? newId(),
    template,
    gameKey: "lol",
    days: 7,
    animation: "pulse",
    durationSec: 3,
    variation: randomize ? generateVariation() : DEFAULT_VARIATION,
  };
}

// ─── palette ────────────────────────────────────────────────────────────
const T = {
  pageBg: "#0a0a12",
  panel: "rgba(179,57,196,0.05)",
  panelBorder: "rgba(179,57,196,0.15)",
  heading: "#B339C4",
  label: "#833D90",
  muted: "#888899",
  text: "#D0D0DC",
  btnBg: "rgba(179,57,196,0.06)",
  btnBorder: "rgba(179,57,196,0.2)",
  btnText: "#9E46AE",
  btnSelBg: "rgba(179,57,196,0.2)",
  btnSelBorder: "rgba(179,57,196,0.5)",
  btnSelText: "#B339C4",
  green: "#84C552",
  greenBg: "rgba(132,197,82,0.12)",
  greenBorder: "rgba(132,197,82,0.35)",
  danger: "rgba(220,80,80,0.9)",
  dangerBg: "rgba(220,80,80,0.08)",
  dangerBorder: "rgba(220,80,80,0.25)",
};

export default function EditorPage() {
  const [eventIdx, setEventIdx] = useState(0);
  const [isEditableEvent, setIsEditableEvent] = useState(false);
  const [editableEvent, setEditableEvent] = useState<EventData>(() => cloneEventForEditing(SAMPLE_EVENTS[0]));
  const [format, setFormat] = useState<Format>("story");
  const [clips, setClips] = useState<Clip[]>(() => [makeClip("anuncio", false, "clip-0")]);
  const [loop, setLoop] = useState(false);
  const [totalSec, setTotalSec] = useState(15);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [audioOffset, setAudioOffset] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.8);

  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [exportProgress, setExportProgress] = useState<{ phase: string; done: number; total: number } | null>(null);
  // Randomize IDs and variations after mount (avoids SSR hydration mismatch from Math.random()).
  useEffect(() => {
    setClips((cs) => cs.map((c) => ({ ...c, id: newId(), variation: generateVariation() })));
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rackRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const elapsedRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  // Refs kept current on every render so the rAF loop can read them without stale closures.
  const clipsRef = useRef(clips);
  clipsRef.current = clips;
  const loopRef = useRef(loop);
  loopRef.current = loop;

  const event = isEditableEvent ? editableEvent : SAMPLE_EVENTS[eventIdx];

  const updateEvent = (patch: Partial<EventData>) =>
    setEditableEvent((prev) => ({ ...prev, ...patch }));
  const updateGame = (idx: number, patch: Partial<GameDetail>) =>
    setEditableEvent((prev) => {
      const gameDetails = prev.gameDetails?.map((g, i) => (i === idx ? { ...g, ...patch } : g));
      return { ...prev, gameDetails, games: getGameDisplayNames(gameDetails) };
    });
  const addGame = () =>
    setEditableEvent((prev) => {
      const gameDetails = [
        ...(prev.gameDetails ?? []),
        { name: "", shortName: "", format: "", teams: "", schedule: "", accent: "green" as const },
      ];
      return { ...prev, gameDetails, games: getGameDisplayNames(gameDetails) };
    });
  const removeGame = (idx: number) =>
    setEditableEvent((prev) => {
      const gameDetails = prev.gameDetails?.filter((_, i) => i !== idx);
      return { ...prev, gameDetails, games: getGameDisplayNames(gameDetails) };
    });

  const sequenceNatural = clips.reduce((s, c) => s + c.durationSec, 0);
  const sequenceTotal = loop ? Math.max(totalSec, 0.1) : sequenceNatural;

  // Resolve active clip from elapsed time.
  const activeIdx = (() => {
    if (clips.length === 0) return 0;
    let t = elapsed;
    if (loop && sequenceNatural > 0) t = t % sequenceNatural;
    let acc = 0;
    for (let i = 0; i < clips.length; i++) {
      acc += clips[i].durationSec;
      if (t < acc) return i;
    }
    return clips.length - 1;
  })();
  const activeClip = clips[activeIdx];

  // ─── playback loop ────────────────────────────────────────────────────
  const setElapsedSync = useCallback((v: number) => {
    elapsedRef.current = v;
    setElapsed(v);
  }, []);

  // Directly write --banner-t on the preview container so the CSS seek is accurate.
  const setBannerT = useCallback((seqTime: number) => {
    const cs = clipsRef.current;
    const nat = cs.reduce((s, c) => s + c.durationSec, 0);
    const t = loopRef.current && nat > 0 ? seqTime % nat : seqTime;
    let acc = 0;
    let intra = t;
    for (const c of cs) {
      if (t < acc + c.durationSec) { intra = t - acc; break; }
      acc += c.durationSec;
    }
    previewRef.current?.style.setProperty("--banner-t", String(intra % 5));
  }, []);

  const sequenceTotalRef = useRef(sequenceTotal);
  sequenceTotalRef.current = sequenceTotal;

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    // Read fresh elapsed from ref — never stale
    const startElapsed = elapsedRef.current >= sequenceTotalRef.current ? 0 : elapsedRef.current;
    const startTime = performance.now();

    if (startElapsed === 0) {
      elapsedRef.current = 0;
      setElapsed(0);
    }
    setBannerT(startElapsed);

    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = audioOffset + startElapsed;
      audioRef.current.volume = audioVolume;
      audioRef.current.play().catch(() => {});
    }

    const loop = () => {
      const next = startElapsed + (performance.now() - startTime) / 1000;
      if (next >= sequenceTotalRef.current) {
        elapsedRef.current = sequenceTotalRef.current;
        setElapsed(sequenceTotalRef.current);
        setPlaying(false);
        if (audioRef.current) audioRef.current.pause();
        return;
      }
      elapsedRef.current = next;
      setElapsed(next);
      setBannerT(next);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // keep audio volume live
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = audioVolume;
  }, [audioVolume]);

  // ─── preview sizing ───────────────────────────────────────────────────
  const previewFormat = activeClip
    ? resolveBanner(
        event,
        activeClip.template,
        activeClip.gameKey,
        format,
        activeClip.days,
        activeClip.variation,
      ).format
    : { width: 1080, height: 1920, aspectRatio: "9:16" };

  const scale = Math.min(420 / previewFormat.width, 600 / previewFormat.height);

  // ─── clip ops ─────────────────────────────────────────────────────────
  const updateClip = (id: string, patch: Partial<Clip>) =>
    setClips((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeClip = (id: string) =>
    setClips((cs) => (cs.length === 1 ? cs : cs.filter((c) => c.id !== id)));
  const duplicateClip = (id: string) =>
    setClips((cs) => {
      const idx = cs.findIndex((c) => c.id === id);
      if (idx < 0) return cs;
      const copy = { ...cs[idx], id: newId(), variation: generateVariation() };
      return [...cs.slice(0, idx + 1), copy, ...cs.slice(idx + 1)];
    });
  const moveClip = (id: string, dir: -1 | 1) =>
    setClips((cs) => {
      const idx = cs.findIndex((c) => c.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= cs.length) return cs;
      const copy = cs.slice();
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  const addClip = () => setClips((cs) => [...cs, makeClip("anuncio", true)]);

  // ─── audio upload ─────────────────────────────────────────────────────
  const onAudioUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAudioUrl(ev.target?.result as string);
      setAudioName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const seekTo = (t: number) => {
    const clamped = Math.max(0, Math.min(sequenceTotal, t));
    setElapsedSync(clamped);
    setBannerT(clamped);
    // If playing, restart the rAF loop from the new position
    if (playing) {
      setPlaying(false);
      // Use a microtask so the false→true flip triggers the effect twice
      setTimeout(() => setPlaying(true), 0);
      if (audioRef.current && audioUrl) {
        audioRef.current.currentTime = audioOffset + clamped;
      }
    }
  };

  // available games for the current event (for spotlight selector)
  const gameKeys = (event.gameDetails ?? []).map((g) => g.shortName.toLowerCase());
  const availableTemplates = event.availableTemplates;

  return (
    <div style={{ minHeight: "100vh", background: T.pageBg, padding: 24, color: T.text }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: 24,
          maxWidth: 1400,
          margin: "0 auto 24px",
        }}
      >
        <div>
          <h1
            className="font-azonix"
            style={{ color: T.heading, fontSize: "1.5rem", marginBottom: 4 }}
          >
            GamER — Editor de video
          </h1>
          <p style={{ fontSize: "0.8125rem", color: T.muted }}>
            Secuenciá plantillas en un video con música.
          </p>
        </div>
        <Link
          href="/"
          style={{
            padding: "6px 14px",
            background: T.btnBg,
            border: `1px solid ${T.btnBorder}`,
            borderRadius: 6,
            color: T.btnText,
            fontSize: "0.8125rem",
            textDecoration: "none",
          }}
        >
          ← Galería
        </Link>
      </header>

      <div className="editor-layout">
        {/* LEFT: controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* event + format */}
          <section style={sectionStyle()}>
            <Row>
              <Field label="Evento">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {SAMPLE_EVENTS.map((ev, i) => (
                    <Btn
                      key={i}
                      sel={!isEditableEvent && eventIdx === i}
                      onClick={() => {
                        setEventIdx(i);
                        setIsEditableEvent(false);
                      }}
                    >
                      {ev.title}
                    </Btn>
                  ))}
                  <Btn
                    sel={isEditableEvent}
                    onClick={() => {
                      if (!isEditableEvent) setEditableEvent(cloneEventForEditing(SAMPLE_EVENTS[eventIdx]));
                      setIsEditableEvent((v) => !v);
                    }}
                  >
                    ✎ Editable
                  </Btn>
                </div>
              </Field>
              <Field label="Formato">
                <div style={{ display: "flex", gap: 6 }}>
                  {(["story", "feed", "whatsapp"] as const).map((f) => (
                    <Btn key={f} sel={format === f} onClick={() => setFormat(f)}>
                      {FORMAT_LABELS[f]}
                    </Btn>
                  ))}
                </div>
              </Field>
            </Row>

            {isEditableEvent && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: `1px solid ${T.panelBorder}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="Título">
                    <input value={event.title} onChange={(e) => updateEvent({ title: e.target.value })} style={inputStyle()} />
                  </Field>
                  <Field label="Subtítulo">
                    <input value={event.subtitle} onChange={(e) => updateEvent({ subtitle: e.target.value })} style={inputStyle()} />
                  </Field>
                  <Field label="Fecha">
                    <input value={event.date} onChange={(e) => updateEvent({ date: e.target.value })} style={inputStyle()} />
                  </Field>
                  <Field label="Horario">
                    <input value={event.time} onChange={(e) => updateEvent({ time: e.target.value })} style={inputStyle()} />
                  </Field>
                  <Field label="Lugar">
                    <input value={event.venue ?? ""} onChange={(e) => updateEvent({ venue: e.target.value })} style={inputStyle()} />
                  </Field>
                  <Field label="Ciudad">
                    <input value={event.city} onChange={(e) => updateEvent({ city: e.target.value })} style={inputStyle()} />
                  </Field>
                  <Field label="Inscripción">
                    <input value={event.entryFee ?? ""} onChange={(e) => updateEvent({ entryFee: e.target.value })} style={inputStyle()} />
                  </Field>
                  <Field label="Inscrip. público">
                    <input value={event.publicEntryFee ?? ""} onChange={(e) => updateEvent({ publicEntryFee: e.target.value })} style={inputStyle()} />
                  </Field>
                </div>

                <Field label="Plantillas disponibles">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(["anuncio", "countdown", "spotlight", "publico"] as const).map((tmpl) => {
                      const on = event.availableTemplates.includes(tmpl);
                      return (
                        <Btn
                          key={tmpl}
                          sel={on}
                          onClick={() => {
                            const next = on
                              ? event.availableTemplates.filter((x) => x !== tmpl)
                              : [...event.availableTemplates, tmpl];
                            if (next.length === 0) return;
                            updateEvent({ availableTemplates: next });
                          }}
                        >
                          {TEMPLATE_LABELS[tmpl]}
                        </Btn>
                      );
                    })}
                  </div>
                </Field>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={labelStyle()}>JUEGOS</span>
                    <button
                      onClick={addGame}
                      style={{ padding: "3px 10px", fontSize: "0.7rem", background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 4, color: T.green, cursor: "pointer" }}
                    >
                      + Agregar juego
                    </button>
                  </div>
                  {(event.gameDetails ?? []).map((g, gi) => (
                    <div key={gi} style={{ padding: 8, background: "rgba(0,0,0,0.15)", border: `1px solid ${T.btnBorder}`, borderRadius: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1fr auto", gap: 6, alignItems: "end" }}>
                        <GameField label="Nombre" value={g.name} onChange={(v) => updateGame(gi, { name: v })} />
                        <GameField label="ID" value={g.shortName} onChange={(v) => updateGame(gi, { shortName: v })} />
                        <GameField label="Formato" value={g.format} onChange={(v) => updateGame(gi, { format: v })} />
                        <button
                          onClick={() => removeGame(gi)}
                          title="Eliminar juego"
                          style={{ padding: "5px 9px", background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 4, color: T.danger, fontSize: 13, cursor: "pointer", lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                        <GameField label="Equipos" value={g.teams} onChange={(v) => updateGame(gi, { teams: v })} />
                        <GameField label="Horario" value={g.schedule} onChange={(v) => updateGame(gi, { schedule: v })} />
                        <GameField label="Caster" value={g.caster ?? ""} onChange={(v) => updateGame(gi, { caster: v })} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
                        <GameField label="Formato de partida (ej: 2 VS 2)" value={g.matchFormat ?? ""} onChange={(v) => updateGame(gi, { matchFormat: v })} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* clip list */}
          <section style={sectionStyle()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={labelStyle()}>CLIPS ({clips.length})</span>
              <button
                onClick={addClip}
                style={{
                  padding: "4px 12px",
                  fontSize: "0.75rem",
                  background: T.greenBg,
                  border: `1px solid ${T.greenBorder}`,
                  borderRadius: 4,
                  color: T.green,
                  cursor: "pointer",
                }}
              >
                + Agregar clip
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {clips.map((clip, i) => (
                <ClipRow
                  key={clip.id}
                  clip={clip}
                  index={i}
                  active={i === activeIdx && playing}
                  availableTemplates={availableTemplates}
                  gameKeys={gameKeys}
                  onUpdate={(patch) => updateClip(clip.id, patch)}
                  onRemove={() => removeClip(clip.id)}
                  onDuplicate={() => duplicateClip(clip.id)}
                  onMoveUp={() => moveClip(clip.id, -1)}
                  onMoveDown={() => moveClip(clip.id, 1)}
                  onRegenerate={() =>
                    updateClip(clip.id, { variation: generateVariation() })
                  }
                  canRemove={clips.length > 1}
                  canMoveUp={i > 0}
                  canMoveDown={i < clips.length - 1}
                />
              ))}
            </div>
          </section>

          {/* loop + total */}
          <section style={sectionStyle()}>
            <Row>
              <Field label="Duración total">
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Btn sel={loop} onClick={() => setLoop((v) => !v)}>
                    {loop ? "✓ Loop" : "Loop"}
                  </Btn>
                  {loop && (
                    <>
                      <input
                        type="number"
                        min={1}
                        step={0.5}
                        value={totalSec}
                        onChange={(e) =>
                          setTotalSec(Math.max(0.1, parseFloat(e.target.value) || 1))
                        }
                        style={inputStyle()}
                      />
                      <span style={{ fontSize: "0.75rem", color: T.muted }}>seg</span>
                    </>
                  )}
                  {!loop && (
                    <span style={{ fontSize: "0.75rem", color: T.muted }}>
                      {sequenceNatural.toFixed(1)} seg (suma de clips)
                    </span>
                  )}
                </div>
              </Field>
            </Row>
          </section>

          {/* audio */}
          <section style={sectionStyle()}>
            <div style={labelStyle()}>MÚSICA</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
              <label
                style={{
                  padding: "6px 14px",
                  background: T.btnBg,
                  border: `1px solid ${T.btnBorder}`,
                  borderRadius: 4,
                  color: T.btnText,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {audioUrl ? "↻ Reemplazar" : "+ Subir audio"}
                <input
                  type="file"
                  accept="audio/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onAudioUpload(f);
                    e.target.value = "";
                  }}
                />
              </label>
              {audioUrl && (
                <>
                  <span style={{ fontSize: "0.75rem", color: T.muted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {audioName}
                  </span>
                  <button
                    onClick={() => {
                      setAudioUrl(null);
                      setAudioName("");
                    }}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.75rem",
                      background: T.dangerBg,
                      border: `1px solid ${T.dangerBorder}`,
                      borderRadius: 4,
                      color: T.danger,
                      cursor: "pointer",
                    }}
                  >
                    × Quitar
                  </button>
                </>
              )}
            </div>
            {audioUrl && (
              <Row style={{ marginTop: 12 }}>
                <Field label="Offset (seg)">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={audioOffset}
                    onChange={(e) => setAudioOffset(Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{ ...inputStyle(), width: 100 }}
                  />
                </Field>
                <Field label="Volumen">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    style={{ width: 160 }}
                  />
                </Field>
              </Row>
            )}
          </section>
        </div>

        {/* RIGHT: preview */}
        <div className="editor-preview" style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <section style={sectionStyle()}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: previewFormat.width * scale,
                  height: previewFormat.height * scale,
                  overflow: "hidden",
                  border: `1px solid ${T.btnSelBorder}`,
                  background: "#000",
                }}
              >
                {activeClip && (
                  <div
                    ref={previewRef}
                    key={activeClip.id}
                    className={
                      activeClip.animation !== "none"
                        ? `banner-animated banner-frame-seek banner-anim-${activeClip.animation}`
                        : "banner-frame-seek"
                    }
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {resolveBanner(
                      event,
                      activeClip.template,
                      activeClip.gameKey,
                      format,
                      activeClip.days,
                      activeClip.variation,
                    ).render()}
                  </div>
                )}
              </div>
            </div>

            {/* transport */}
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="range"
                min={0}
                max={sequenceTotal}
                step={0.05}
                value={elapsed}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: T.muted, fontFamily: "monospace" }}>
                  {fmt(elapsed)} / {fmt(sequenceTotal)}
                </span>
                <span style={{ fontSize: "0.75rem", color: T.muted }}>
                  Clip {activeIdx + 1}/{clips.length}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPlaying((v) => !v)}
                  style={{
                    flex: 1,
                    padding: "8px 14px",
                    background: playing ? T.btnSelBg : T.greenBg,
                    border: `1px solid ${playing ? T.btnSelBorder : T.greenBorder}`,
                    borderRadius: 4,
                    color: playing ? T.btnSelText : T.green,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {playing ? "⏸ Pausar" : "▶ Reproducir"}
                </button>
                <button
                  onClick={() => {
                    setPlaying(false);
                    setElapsedSync(0);
                  }}
                  style={{
                    padding: "8px 14px",
                    background: T.btnBg,
                    border: `1px solid ${T.btnBorder}`,
                    borderRadius: 4,
                    color: T.btnText,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                  }}
                >
                  ⏮ Inicio
                </button>
              </div>
              <button
                disabled={exportProgress !== null}
                onClick={async () => {
                  if (!rackRef.current) return;
                  setPlaying(false);
                  setExportProgress({ phase: "capture", done: 0, total: 1 });
                  try {
                    const clipNodes = Array.from(
                      rackRef.current.querySelectorAll<HTMLElement>("[data-clip-id]"),
                    );
                    const seqClips = clips.map((c) => {
                      const n = clipNodes.find((el) => el.dataset.clipId === c.id);
                      if (!n) throw new Error(`Clip node missing: ${c.id}`);
                      return {
                        id: c.id,
                        node: n,
                        durationSec: c.durationSec,
                        animated: c.animation !== "none",
                      };
                    });
                    await exportSequenceMp4({
                      clips: seqClips,
                      totalSec: sequenceTotal,
                      loop,
                      width: previewFormat.width,
                      height: previewFormat.height,
                      fps: 30,
                      audio: audioUrl
                        ? { url: audioUrl, offsetSec: audioOffset, volume: audioVolume }
                        : null,
                      filename: `gamer-sequence-${format}`,
                      onProgress: (phase, done, total) =>
                        setExportProgress({ phase, done, total }),
                    });
                  } catch (err) {
                    console.error(err);
                    alert(err instanceof Error ? err.message : "Error exportando MP4");
                  } finally {
                    setExportProgress(null);
                  }
                }}
                style={{
                  padding: "10px 14px",
                  background: exportProgress ? "rgba(255,130,0,0.18)" : "rgba(255,130,0,0.12)",
                  border: "1px solid rgba(255,130,0,0.35)",
                  borderRadius: 4,
                  color: "#FF8200",
                  fontSize: "0.8125rem",
                  cursor: exportProgress ? "wait" : "pointer",
                  fontWeight: 500,
                  opacity: exportProgress ? 0.8 : 1,
                }}
              >
                {exportProgress
                  ? `${phaseLabel(exportProgress.phase)} ${exportProgress.done}/${exportProgress.total}…`
                  : "⬇ Descargar MP4"}
              </button>
            </div>
          </section>
        </div>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

      {/* Hidden clip rack — one full-size banner per clip for export capture. */}
      <div
        ref={rackRef}
        aria-hidden
        suppressHydrationWarning
        style={{ position: "fixed", left: -99999, top: -99999, pointerEvents: "none" }}
      >
        {clips.map((clip) => (
          <div
            key={clip.id}
            data-clip-id={clip.id}
            className={
              clip.animation === "none"
                ? undefined
                : `banner-animated banner-anim-${clip.animation}`
            }
          >
            {resolveBanner(
              event,
              clip.template,
              clip.gameKey,
              format,
              clip.days,
              clip.variation,
            ).render()}
          </div>
        ))}
      </div>
    </div>
  );
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case "capture": return "Capturando";
    case "encode":  return "Codificando";
    case "audio":   return "Audio";
    case "mux":     return "Finalizando";
    default:        return "Procesando";
  }
}

// ─── sub-components ─────────────────────────────────────────────────────

function ClipRow({
  clip,
  index,
  active,
  availableTemplates,
  gameKeys,
  onUpdate,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onRegenerate,
  canRemove,
  canMoveUp,
  canMoveDown,
}: {
  clip: Clip;
  index: number;
  active: boolean;
  availableTemplates: Template[];
  gameKeys: string[];
  onUpdate: (patch: Partial<Clip>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRegenerate: () => void;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div
      style={{
        padding: 10,
        background: active ? "rgba(132,197,82,0.08)" : "rgba(0,0,0,0.15)",
        border: `1px solid ${active ? T.greenBorder : T.btnBorder}`,
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "0.75rem",
            color: active ? T.green : T.muted,
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          #{index + 1}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <IconBtn title="Mover arriba" onClick={onMoveUp} disabled={!canMoveUp}>↑</IconBtn>
          <IconBtn title="Mover abajo" onClick={onMoveDown} disabled={!canMoveDown}>↓</IconBtn>
          <IconBtn title="Regenerar variación" onClick={onRegenerate}>↻</IconBtn>
          <IconBtn title="Duplicar" onClick={onDuplicate}>⎘</IconBtn>
          <IconBtn title="Eliminar" onClick={onRemove} disabled={!canRemove} danger>×</IconBtn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <Select
          label="Plantilla"
          value={clip.template}
          options={availableTemplates.map((t) => ({ value: t, label: TEMPLATE_LABELS[t] }))}
          onChange={(v) => onUpdate({ template: v as Template })}
        />
        <Select
          label="Animación"
          value={clip.animation}
          options={ANIM_OPTIONS.map((a) => ({ value: a.id, label: a.label }))}
          onChange={(v) => onUpdate({ animation: v as AnimStyle })}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={miniLabel()}>Duración (s)</span>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={clip.durationSec}
            onChange={(e) =>
              onUpdate({ durationSec: Math.max(0.5, parseFloat(e.target.value) || 1) })
            }
            style={inputStyle()}
          />
        </div>
        {clip.template === "spotlight" && gameKeys.length > 0 && (
          <Select
            label="Juego"
            value={clip.gameKey}
            options={gameKeys.map((g) => ({ value: g, label: g.toUpperCase() }))}
            onChange={(v) => onUpdate({ gameKey: v })}
          />
        )}
        {clip.template === "countdown" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={miniLabel()}>Días</span>
            <input
              type="number"
              min={0}
              value={clip.days}
              onChange={(e) => onUpdate({ days: Math.max(0, parseInt(e.target.value) || 0) })}
              style={inputStyle()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function GameField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: 9, color: T.muted, letterSpacing: "0.06em" }}>{label.toUpperCase()}</span>
      <input
        value={value}
        placeholder={label}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle(), width: "100%", boxSizing: "border-box", fontSize: 11, padding: "4px 6px" }}
      />
    </label>
  );
}

function Row({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: "flex", gap: 16, flexWrap: "wrap", ...style }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={labelStyle()}>{label}</span>
      {children}
    </div>
  );
}

function Btn({ sel, onClick, children }: { sel?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        background: sel ? T.btnSelBg : T.btnBg,
        border: `1px solid ${sel ? T.btnSelBorder : T.btnBorder}`,
        borderRadius: 4,
        color: sel ? T.btnSelText : T.btnText,
        fontSize: "0.75rem",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 24,
        height: 24,
        padding: 0,
        background: danger ? T.dangerBg : T.btnBg,
        border: `1px solid ${danger ? T.dangerBorder : T.btnBorder}`,
        borderRadius: 4,
        color: danger ? T.danger : T.btnText,
        fontSize: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.3 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={miniLabel()}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle()}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── style helpers ──────────────────────────────────────────────────────
function sectionStyle(): React.CSSProperties {
  return {
    padding: 16,
    background: T.panel,
    border: `1px solid ${T.panelBorder}`,
    borderRadius: 8,
  };
}
function labelStyle(): React.CSSProperties {
  return {
    fontSize: "0.7rem",
    fontFamily: "Azonix, sans-serif",
    letterSpacing: "0.1em",
    color: T.label,
    display: "block",
  };
}
function miniLabel(): React.CSSProperties {
  return { fontSize: 10, color: T.muted, letterSpacing: "0.06em" };
}
function inputStyle(): React.CSSProperties {
  return {
    background: T.btnBg,
    border: `1px solid ${T.btnBorder}`,
    color: T.text,
    borderRadius: 4,
    padding: "5px 8px",
    fontSize: 12,
    fontFamily: "inherit",
  };
}
function selectStyle(): React.CSSProperties {
  return {
    background: T.btnBg,
    border: `1px solid ${T.btnBorder}`,
    color: T.text,
    borderRadius: 4,
    padding: "5px 6px",
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
  };
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${m}:${sec.toString().padStart(2, "0")}.${ms}`;
}

"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  SAMPLE_EVENTS,
  cloneEventForEditing,
  getGameDisplayNames,
  type EventData,
  type GameDetail,
} from "@/lib/event-data";
import { exportBanner } from "@/lib/export-banner";
import { exportBannerMp4 } from "@/lib/export-mp4";
import { generateVariation, DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import {
  resolveBanner,
  TEMPLATE_LABELS,
  FORMAT_LABELS,
  type Template,
  type Format,
} from "@/lib/banner-registry";

const THEME = {
  dark: {
    pageBg: "#0a0a12",
    heading: "#B339C4",
    muted: "#888899",
    categoryLabel: "#833D90",
    btnSelectedText: "#B339C4",
    btnSelectedBg: "rgba(179,57,196,0.2)",
    btnSelectedBorder: "rgba(179,57,196,0.5)",
    btnText: "#9E46AE",
    btnBg: "rgba(179,57,196,0.04)",
    btnBorder: "rgba(179,57,196,0.15)",
    previewLabel: "#9E46AE",
    frameBorder: "rgba(179,57,196,0.2)",
  },
  light: {
    pageBg: "#f0eef8",
    heading: "#8B22A0",
    muted: "#666677",
    categoryLabel: "#833D90",
    btnSelectedText: "#8B22A0",
    btnSelectedBg: "rgba(179,57,196,0.12)",
    btnSelectedBorder: "rgba(179,57,196,0.45)",
    btnText: "#9E46AE",
    btnBg: "rgba(179,57,196,0.06)",
    btnBorder: "rgba(179,57,196,0.2)",
    previewLabel: "#9E46AE",
    frameBorder: "rgba(179,57,196,0.3)",
  },
};

export default function GalleryPage() {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [eventIdx, setEventIdx] = useState(0);
  const [template, setTemplate] = useState<Template>("anuncio");
  const [gameKey, setGameKey] = useState<string>("");
  const [format, setFormat] = useState<Format>("story");
  const [days, setDays] = useState<number>(14);
  const [isEditableDays, setIsEditableDays] = useState(false);
  const [inputValue, setInputValue] = useState<string>("14");
  const [variation, setVariation] = useState<BannerVariation>(DEFAULT_VARIATION);
  const [isEditableEvent, setIsEditableEvent] = useState(false);
  const [editableEvent, setEditableEvent] = useState<EventData>(() => cloneEventForEditing(SAMPLE_EVENTS[0]));
  const [animated, setAnimated] = useState(false);
  const [animStyle, setAnimStyle] = useState<"glitch" | "scan" | "pulse" | "drift" | "matrix">("pulse");
  const [mp4Progress, setMp4Progress] = useState<{ done: number; total: number } | null>(null);
  const [sponsorMode, setSponsorMode] = useState(false);
  const [sponsorLogos, setSponsorLogos] = useState<string[]>([]);
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    setVariation(generateVariation());
  }, []);

  const event = isEditableEvent ? editableEvent : SAMPLE_EVENTS[eventIdx];

  function updateEvent(updates: Partial<EventData>) {
    setEditableEvent((prev) => ({ ...prev, ...updates }));
  }

  function updateGame(idx: number, updates: Partial<GameDetail>) {
    setEditableEvent((prev) => {
      const nextGameDetails = prev.gameDetails?.map((game, i) =>
        i === idx ? { ...game, ...updates } : game,
      );

      return {
        ...prev,
        gameDetails: nextGameDetails,
        games: getGameDisplayNames(nextGameDetails),
      };
    });
  }

  function addGame() {
    setEditableEvent((prev) => {
      const nextGameDetails = [
        ...(prev.gameDetails ?? []),
        { name: "", shortName: "", format: "", teams: "", schedule: "", accent: "green" as const },
      ];

      return {
        ...prev,
        gameDetails: nextGameDetails,
        games: getGameDisplayNames(nextGameDetails),
      };
    });
  }

  function removeGame(idx: number) {
    setEditableEvent((prev) => {
      const nextGameDetails = prev.gameDetails?.filter((_, i) => i !== idx);

      return {
        ...prev,
        gameDetails: nextGameDetails,
        games: getGameDisplayNames(nextGameDetails),
      };
    });
  }

  const availableTemplates = event.availableTemplates;
  const activeTemplate = availableTemplates.includes(template) ? template : availableTemplates[0];
  const gameDetails = event.gameDetails ?? [];
  const activeGameKey = gameDetails.some((g) => g.shortName.toLowerCase() === gameKey)
    ? gameKey
    : (gameDetails[0]?.shortName.toLowerCase() ?? "");

  const sponsorSupported = format === "story" || format === "feed";
  const sponsorProps = sponsorSupported && sponsorMode ? { logos: sponsorLogos, bgImage: bgImage ?? undefined } : undefined;
  const selected = resolveBanner(event, activeTemplate, activeGameKey, format, days, variation, sponsorProps);
  const scale = Math.min(450 / selected.format.width, 1);
  const t = THEME[theme];

  return (
    <div
      className="min-h-screen p-8 flex flex-col items-center transition-colors duration-300"
      style={{ background: t.pageBg }}
    >
      <header className="mb-8 w-full max-w-3xl flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="font-azonix text-2xl mb-1"
            style={{ color: t.heading }}
          >
            GamER — Banners
          </h1>
          <p className="text-sm" style={{ color: t.muted }}>
            Seleccioná un banner para previsualizar. PNG estático o MP4 animado.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/editor"
            style={{
              padding: "6px 14px",
              background: "rgba(132,197,82,0.12)",
              border: "1px solid rgba(132,197,82,0.35)",
              borderRadius: "6px",
              color: "#84C552",
              fontSize: "0.8125rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            ▶ Editor de video
          </Link>
          <Link
            href="/print"
            style={{
              padding: "6px 14px",
              background: "rgba(179,57,196,0.12)",
              border: "1px solid rgba(179,57,196,0.35)",
              borderRadius: "6px",
              color: "#C06DD0",
              fontSize: "0.8125rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            🖨 Impresos
          </Link>
          <div
            style={{
              display: "flex",
              background: theme === "dark" ? "rgba(179,57,196,0.08)" : "rgba(179,57,196,0.04)",
              border: `1px solid ${theme === "dark" ? "rgba(179,57,196,0.25)" : "rgba(179,57,196,0.15)"}`,
              borderRadius: "6px",
              padding: "4px",
              gap: "4px",
            }}
          >
            <button
              onClick={() => setTheme("dark")}
              style={{
                padding: "6px 14px",
                background: theme === "dark" ? "rgba(179,57,196,0.25)" : "transparent",
                border: "none",
                borderRadius: "4px",
                color: theme === "dark" ? "#B339C4" : t.muted,
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              ☾ Oscuro
            </button>
            <button
              onClick={() => setTheme("light")}
              style={{
                padding: "6px 14px",
                background: theme === "light" ? "rgba(179,57,196,0.25)" : "transparent",
                border: "none",
                borderRadius: "4px",
                color: theme === "light" ? "#8B22A0" : t.muted,
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              ☀ Claro
            </button>
          </div>
        </div>
      </header>

      {/* Banner selector */}
      <nav className="mb-8 w-full max-w-3xl space-y-4">
        {/* EVENTO */}
        <div>
          <span
            className="text-xs font-azonix mb-2 block"
            style={{ letterSpacing: "0.1em", color: t.categoryLabel }}
          >
            EVENTO
          </span>
          <div className="flex gap-2 flex-wrap">
            {SAMPLE_EVENTS.map((ev, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setEventIdx(idx);
                  setIsEditableEvent(false);
                  setTemplate(ev.availableTemplates[0]);
                  setGameKey(ev.gameDetails?.[0]?.shortName.toLowerCase() ?? "");
                }}
                className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                style={{
                  background: !isEditableEvent && eventIdx === idx ? t.btnSelectedBg : t.btnBg,
                  border: `1px solid ${!isEditableEvent && eventIdx === idx ? t.btnSelectedBorder : t.btnBorder}`,
                  color: !isEditableEvent && eventIdx === idx ? t.btnSelectedText : t.btnText,
                }}
              >
                {ev.title}
              </button>
            ))}
            <button
              onClick={() => {
                if (!isEditableEvent) {
                  setEditableEvent(cloneEventForEditing(SAMPLE_EVENTS[eventIdx]));
                }
                setIsEditableEvent((v) => !v);
              }}
              className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
              style={{
                background: isEditableEvent ? t.btnSelectedBg : t.btnBg,
                border: `1px solid ${isEditableEvent ? t.btnSelectedBorder : t.btnBorder}`,
                color: isEditableEvent ? t.btnSelectedText : t.btnText,
              }}
            >
              Editable
            </button>
          </div>
          {isEditableEvent && (
            <div
              style={{
                marginTop: 12,
                padding: "16px",
                background: t.btnBg,
                border: `1px solid ${t.btnBorder}`,
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Row 1: basic fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "Título", field: "title" as const },
                  { label: "Fecha", field: "date" as const },
                  { label: "Horario", field: "time" as const },
                ].map(({ label, field }) => (
                  <label key={field} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: 10, color: t.categoryLabel, letterSpacing: "0.08em", fontFamily: "azonix, sans-serif" }}>{label.toUpperCase()}</span>
                    <input
                      type="text"
                      value={String(editableEvent[field] ?? "")}
                      onChange={(e) => updateEvent({ [field]: e.target.value })}
                      style={{
                        background: t.btnBg,
                        border: `1px solid ${t.btnSelectedBorder}`,
                        color: t.btnText,
                        borderRadius: 4,
                        padding: "4px 8px",
                        fontSize: 12,
                      }}
                    />
                  </label>
                ))}
              </div>

              {/* Row 2 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "Lugar", field: "venue" as const },
                  { label: "Ciudad", field: "city" as const },
                  { label: "Inscripción", field: "entryFee" as const },
                ].map(({ label, field }) => (
                  <label key={field} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: 10, color: t.categoryLabel, letterSpacing: "0.08em", fontFamily: "azonix, sans-serif" }}>{label.toUpperCase()}</span>
                    <input
                      type="text"
                      value={String(editableEvent[field] ?? "")}
                      onChange={(e) => updateEvent({ [field]: e.target.value })}
                      style={{
                        background: t.btnBg,
                        border: `1px solid ${t.btnSelectedBorder}`,
                        color: t.btnText,
                        borderRadius: 4,
                        padding: "4px 8px",
                        fontSize: 12,
                      }}
                    />
                  </label>
                ))}
              </div>

              {/* Row 3: publico fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 10, color: t.categoryLabel, letterSpacing: "0.08em", fontFamily: "azonix, sans-serif" }}>INSCRIP. PÚBLICO</span>
                  <input
                    type="text"
                    value={String(editableEvent.publicEntryFee ?? "")}
                    onChange={(e) => updateEvent({ publicEntryFee: e.target.value })}
                    style={{
                      background: t.btnBg,
                      border: `1px solid ${t.btnSelectedBorder}`,
                      color: t.btnText,
                      borderRadius: 4,
                      padding: "4px 8px",
                      fontSize: 12,
                    }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 10, color: t.categoryLabel, letterSpacing: "0.08em", fontFamily: "azonix, sans-serif" }}>JUEGOS DE CONSOLA (separados por coma)</span>
                  <input
                    type="text"
                    value={(editableEvent.consoleGames ?? []).join(", ")}
                    onChange={(e) =>
                      updateEvent({
                        consoleGames: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    style={{
                      background: t.btnBg,
                      border: `1px solid ${t.btnSelectedBorder}`,
                      color: t.btnText,
                      borderRadius: 4,
                      padding: "4px 8px",
                      fontSize: 12,
                    }}
                  />
                </label>
              </div>

              {/* Available templates */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 10, color: t.categoryLabel, letterSpacing: "0.08em", fontFamily: "azonix, sans-serif" }}>PLANTILLAS DISPONIBLES</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["anuncio", "countdown", "spotlight", "publico"] as const).map((tmpl) => {
                    const active = editableEvent.availableTemplates.includes(tmpl);
                    return (
                      <button
                        key={tmpl}
                        onClick={() => {
                          const next = active
                            ? editableEvent.availableTemplates.filter((t) => t !== tmpl)
                            : [...editableEvent.availableTemplates, tmpl];
                          if (next.length === 0) return;
                          updateEvent({ availableTemplates: next });
                        }}
                        className="px-3 py-1 text-xs font-medium cursor-pointer transition-all"
                        style={{
                          background: active ? t.btnSelectedBg : t.btnBg,
                          border: `1px solid ${active ? t.btnSelectedBorder : t.btnBorder}`,
                          color: active ? t.btnSelectedText : t.muted,
                          borderRadius: 4,
                        }}
                      >
                        {TEMPLATE_LABELS[tmpl]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Game details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: t.categoryLabel, letterSpacing: "0.08em", fontFamily: "azonix, sans-serif" }}>JUEGOS</span>
                  <button
                    onClick={addGame}
                    className="cursor-pointer"
                    style={{
                      fontSize: 11,
                      color: t.btnSelectedText,
                      background: t.btnSelectedBg,
                      border: `1px solid ${t.btnSelectedBorder}`,
                      borderRadius: 4,
                      padding: "2px 10px",
                    }}
                  >
                    + Agregar juego
                  </button>
                </div>
                {(editableEvent.gameDetails ?? []).map((g, gi) => {
                  const inputStyle = {
                    background: t.btnBg,
                    border: `1px solid ${t.btnBorder}`,
                    color: t.btnText,
                    borderRadius: 4,
                    padding: "4px 6px",
                    fontSize: 11,
                    width: "100%",
                    boxSizing: "border-box" as const,
                  };
                  const mkLabel = (label: string, field: keyof GameDetail) => (
                    <label key={field} style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      <span style={{ fontSize: 9, color: t.muted, letterSpacing: "0.06em" }}>{label.toUpperCase()}</span>
                      <input
                        type="text"
                        value={String(g[field] ?? "")}
                        onChange={(e) => updateGame(gi, { [field]: e.target.value })}
                        placeholder={label}
                        style={inputStyle}
                      />
                    </label>
                  );
                  return (
                    <div
                      key={gi}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        padding: "8px",
                        background: "rgba(0,0,0,0.1)",
                        borderRadius: 4,
                        border: `1px solid ${t.btnBorder}`,
                      }}
                    >
                      {/* Row A: Nombre | ID | Formato | × */}
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1fr auto", gap: 6, alignItems: "end" }}>
                        {mkLabel("Nombre", "name")}
                        {mkLabel("ID", "shortName")}
                        {mkLabel("Formato", "format")}
                        <button
                          onClick={() => removeGame(gi)}
                          title="Eliminar juego"
                          className="cursor-pointer"
                          style={{
                            fontSize: 14,
                            color: "rgba(220,80,80,0.7)",
                            background: "rgba(220,80,80,0.06)",
                            border: "1px solid rgba(220,80,80,0.2)",
                            borderRadius: 4,
                            padding: "4px 8px",
                            lineHeight: 1,
                            alignSelf: "end",
                          }}
                        >
                          ×
                        </button>
                      </div>

                      {/* Row B: Equipos | Horario | Caster */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                        {mkLabel("Equipos", "teams")}
                        {mkLabel("Horario", "schedule")}
                        {mkLabel("Caster", "caster")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* PLANTILLA */}
        <div>
          <span
            className="text-xs font-azonix mb-2 block"
            style={{ letterSpacing: "0.1em", color: t.categoryLabel }}
          >
            PLANTILLA
          </span>
          <div className="flex gap-2">
            {availableTemplates.map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => setTemplate(tmpl)}
                className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                style={{
                  background: activeTemplate === tmpl ? t.btnSelectedBg : t.btnBg,
                  border: `1px solid ${activeTemplate === tmpl ? t.btnSelectedBorder : t.btnBorder}`,
                  color: activeTemplate === tmpl ? t.btnSelectedText : t.btnText,
                }}
              >
                {TEMPLATE_LABELS[tmpl]}
              </button>
            ))}
          </div>
        </div>

        {/* FORMATO */}
        <div>
          <span
            className="text-xs font-azonix mb-2 block"
            style={{ letterSpacing: "0.1em", color: t.categoryLabel }}
          >
            FORMATO
          </span>
          <div className="flex gap-2">
            {(["story", "feed", "whatsapp"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                style={{
                  background: format === fmt ? t.btnSelectedBg : t.btnBg,
                  border: `1px solid ${format === fmt ? t.btnSelectedBorder : t.btnBorder}`,
                  color: format === fmt ? t.btnSelectedText : t.btnText,
                }}
              >
                {FORMAT_LABELS[fmt]}
              </button>
            ))}
          </div>
        </div>

        {/* JUEGO + DÍAS container (always reserves space) */}
        <div
          style={{
            minHeight: 70,
            overflow: "hidden",
            transition: "min-height 0.2s ease",
          }}
        >
          {activeTemplate === "spotlight" && gameDetails.length > 0 && (
            <div>
              <span
                className="text-xs font-azonix mb-2 block"
                style={{ letterSpacing: "0.1em", color: t.categoryLabel }}
              >
                JUEGO
              </span>
              <div className="flex gap-2">
                {gameDetails.map((g) => {
                  const key = g.shortName.toLowerCase();
                  return (
                    <button
                      key={key}
                      onClick={() => setGameKey(key)}
                      className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                      style={{
                        background: activeGameKey === key ? t.btnSelectedBg : t.btnBg,
                        border: `1px solid ${activeGameKey === key ? t.btnSelectedBorder : t.btnBorder}`,
                        color: activeGameKey === key ? t.btnSelectedText : t.btnText,
                      }}
                    >
                      {g.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {activeTemplate === "countdown" && (
            <div>
              <span
                className="text-xs font-azonix mb-2 block"
                style={{ letterSpacing: "0.1em", color: t.categoryLabel }}
              >
                DÍAS
              </span>
              <div className="flex gap-2">
                {([14, 7, 3, 1] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDays(d);
                      setInputValue(String(d));
                      setIsEditableDays(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                    style={{
                      background: !isEditableDays && days === d ? t.btnSelectedBg : t.btnBg,
                      border: `1px solid ${!isEditableDays && days === d ? t.btnSelectedBorder : t.btnBorder}`,
                      color: !isEditableDays && days === d ? t.btnSelectedText : t.btnText,
                    }}
                  >
                    {d === 1 ? "1 día" : `${d} días`}
                  </button>
                ))}
                <button
                  onClick={() => setIsEditableDays(!isEditableDays)}
                  className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                  style={{
                    background: isEditableDays ? t.btnSelectedBg : t.btnBg,
                    border: `1px solid ${isEditableDays ? t.btnSelectedBorder : t.btnBorder}`,
                    color: isEditableDays ? t.btnSelectedText : t.btnText,
                  }}
                >
                  Editable
                </button>
              </div>
              {isEditableDays && (
                <input
                  type="number"
                  min="0"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      setDays(val);
                    }
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (isNaN(val) || val < 0) {
                      setInputValue("0");
                      setDays(0);
                    }
                  }}
                  className="mt-3 px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: t.btnBg,
                    border: `1px solid ${t.btnSelectedBorder}`,
                    color: t.btnText,
                    borderRadius: "4px",
                    width: "80px",
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* SPONSORS — available for IG Story and IG Feed */}
        {sponsorSupported && (
          <div>
            <span className="text-xs font-azonix mb-2 block" style={{ letterSpacing: "0.1em", color: t.categoryLabel }}>
              SPONSORS
            </span>
            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => {
                  setSponsorMode((v) => {
                    if (v) {
                      setSponsorLogos([]);
                      setBgImage(null);
                    }
                    return !v;
                  });
                }}
                className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                style={{
                  background: sponsorMode ? t.btnSelectedBg : t.btnBg,
                  border: `1px solid ${sponsorMode ? t.btnSelectedBorder : t.btnBorder}`,
                  color: sponsorMode ? t.btnSelectedText : t.btnText,
                }}
              >
                {sponsorMode ? "✓ Modo Sponsors" : "Modo Sponsors"}
              </button>
              {sponsorMode && (
                <>
                  <label
                    className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                    style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.btnText }}
                  >
                    + Logos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        Promise.all(
                          files.map(
                            (f) =>
                              new Promise<string>((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (ev) => resolve(ev.target?.result as string);
                                reader.onerror = () => resolve("");
                                reader.onabort = () => resolve("");
                                reader.readAsDataURL(f);
                              }),
                          ),
                        ).then((urls) =>
                          setSponsorLogos((prev) => [...prev, ...urls.filter(Boolean)]),
                        );
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {sponsorLogos.length > 0 && (
                    <button
                      onClick={() => setSponsorLogos([])}
                      className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                      style={{ background: "rgba(220,80,80,0.08)", border: "1px solid rgba(220,80,80,0.25)", color: "rgba(220,100,100,0.9)" }}
                    >
                      × Limpiar logos ({sponsorLogos.length})
                    </button>
                  )}
                  <label
                    className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                    style={{
                      background: bgImage ? t.btnSelectedBg : t.btnBg,
                      border: `1px solid ${bgImage ? t.btnSelectedBorder : t.btnBorder}`,
                      color: bgImage ? t.btnSelectedText : t.btnText,
                    }}
                  >
                    {bgImage ? "✓ Fondo subido" : "Subir fondo"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setBgImage(ev.target?.result as string);
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {bgImage && (
                    <button
                      onClick={() => setBgImage(null)}
                      className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                      style={{ background: "rgba(220,80,80,0.08)", border: "1px solid rgba(220,80,80,0.25)", color: "rgba(220,100,100,0.9)" }}
                    >
                      × Quitar fondo
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Preview */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h2
            className="text-sm font-medium"
            style={{ color: t.previewLabel }}
          >
            {event.title} · {TEMPLATE_LABELS[activeTemplate]}
            {activeTemplate === "countdown" && ` — ${days === 0 ? "Hoy" : days === 1 ? "1 día" : `${days} días`}`}
            {activeTemplate === "spotlight" && activeGameKey && ` — ${activeGameKey.toUpperCase()}`}
            {" · "}
            {FORMAT_LABELS[format]}
          </h2>
          <p className="text-xs" style={{ color: t.muted }}>
            {selected.format.width}×{selected.format.height}px ·{" "}
            {selected.format.aspectRatio}
          </p>
        </div>

        <div
          style={{
            width: selected.format.width * scale,
            height: selected.format.height * scale,
            overflow: "hidden",
            border: `1px solid ${t.frameBorder}`,
          }}
        >
          <div
            ref={bannerRef}
            className={animated ? `banner-animated banner-anim-${animStyle}` : undefined}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {selected.render()}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => setVariation(generateVariation())}
            className="px-4 py-2 text-sm font-medium cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${t.btnBorder}`,
              color: t.btnText,
            }}
          >
            Regenerar
          </button>
          <button
            onClick={() => setAnimated((v) => !v)}
            className="px-4 py-2 text-sm font-medium cursor-pointer"
            style={{
              background: animated ? t.btnSelectedBg : t.btnBg,
              border: `1px solid ${animated ? t.btnSelectedBorder : t.btnBorder}`,
              color: animated ? t.btnSelectedText : t.btnText,
            }}
          >
            {animated ? "⏸ Detener" : "▷ Animar"}
          </button>
          <button
            onClick={() => {
              if (bannerRef.current) {
                const el = bannerRef.current.firstElementChild as HTMLElement;
                const id = `${activeTemplate}-${format}${activeTemplate === "countdown" ? `-${days}` : ""}${activeTemplate === "spotlight" ? `-${activeGameKey}` : ""}`;
                if (el) exportBanner(el, `gamer-${id}`);
              }
            }}
            className="px-4 py-2 text-sm font-medium cursor-pointer"
            style={{
              background: "rgba(132,197,82,0.12)",
              border: "1px solid rgba(132,197,82,0.3)",
              color: "#84C552",
            }}
          >
            Descargar PNG
          </button>
          <button
            onClick={() => {
              if (bgRef.current) {
                const el = bgRef.current.firstElementChild as HTMLElement;
                const id = `${activeTemplate}-${format}${activeTemplate === "countdown" ? `-${days}` : ""}${activeTemplate === "spotlight" ? `-${activeGameKey}` : ""}`;
                if (el) exportBanner(el, `gamer-${id}-fondo`);
              }
            }}
            className="px-4 py-2 text-sm font-medium cursor-pointer"
            style={{
              background: "rgba(179,57,196,0.12)",
              border: "1px solid rgba(179,57,196,0.3)",
              color: "#B339C4",
            }}
          >
            Descargar Fondo
          </button>
          <button
            disabled={mp4Progress !== null}
            onClick={async () => {
              if (!bannerRef.current) return;
              const el = bannerRef.current.firstElementChild as HTMLElement;
              if (!el) return;
              const id = `${activeTemplate}-${format}${activeTemplate === "countdown" ? `-${days}` : ""}${activeTemplate === "spotlight" ? `-${activeGameKey}` : ""}`;

              const totalSeconds = format === "story" ? 15 : 5;
              setMp4Progress({ done: 0, total: Math.round(totalSeconds * 30) });

              try {
                await exportBannerMp4(el, `gamer-${id}`, {
                  loopSeconds: 5,
                  totalSeconds,
                  fps: 30,
                  onProgress: (done, total) => setMp4Progress({ done, total }),
                });
              } catch (err) {
                console.error(err);
                alert(err instanceof Error ? err.message : "Error exportando MP4");
              } finally {
                setMp4Progress(null);
              }
            }}
            className="px-4 py-2 text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            style={{
              background: "rgba(255,130,0,0.12)",
              border: "1px solid rgba(255,130,0,0.35)",
              color: "#FF8200",
            }}
          >
            {mp4Progress
              ? `Renderizando ${mp4Progress.done}/${mp4Progress.total}…`
              : "Descargar MP4"}
          </button>
        </div>
      </div>

      {/* Animation style selector — visible only when animated */}
      {animated && (
        <div className="flex flex-col items-center gap-2 mt-1">
          <span className="text-xs font-azonix" style={{ color: t.categoryLabel, letterSpacing: "0.1em" }}>
            ESTILO DE ANIMACIÓN
          </span>
          <div className="flex gap-2">
            {(
              [
                { id: "glitch", label: "⚡ Glitch", desc: "Jitter + RGB split" },
                { id: "scan", label: "📡 Scan", desc: "CRT scanline sweep" },
                { id: "pulse", label: "💜 Pulse", desc: "Neon breathing" },
                { id: "drift", label: "🌊 Drift", desc: "Slow hue drift" },
                { id: "matrix", label: "🟢 Matrix", desc: "Digital rain" },
              ] as const
            ).map(({ id, label, desc }) => (
              <button
                key={id}
                onClick={() => setAnimStyle(id)}
                title={desc}
                className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                style={{
                  background: animStyle === id ? t.btnSelectedBg : t.btnBg,
                  border: `1px solid ${animStyle === id ? t.btnSelectedBorder : t.btnBorder}`,
                  color: animStyle === id ? t.btnSelectedText : t.btnText,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Offscreen background render for export */}
      <div
        ref={bgRef}
        style={{ position: "fixed", left: -9999, top: -9999 }}
        aria-hidden
      >
        {selected.renderBg()}
      </div>
    </div>
  );
}

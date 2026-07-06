"use client";

import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import { exportBanner } from "@/lib/export-banner";
import { FORMATS } from "@/lib/formats";
import { QrSign } from "@/components/print/qr-sign";
import { WaySign, type ArrowDir } from "@/components/print/way-sign";
import { Cronograma, type ScheduleItem } from "@/components/print/cronograma";
import {
  MenuGastronomico,
  type MenuCategory,
  type MenuAccent,
} from "@/components/print/menu-gastronomico";
import { StaffCredential, type CredentialAccent } from "@/components/print/staff-credential";
import { CredentialSheet } from "@/components/print/credential-sheet";
import { buildWifiPayload } from "@/components/print/qr-code";
import { InstagramIcon, DiscordIcon, WifiIcon } from "@/components/print/platform-icons";
import {
  OPEN_DUO_SCHEDULE,
  OPEN_DUO_MENU,
  OPEN_DUO_MENU_LABELS_ONLY,
  OPEN_DUO_MENU_BLANK,
  DEFAULT_DISCORD_URL,
  DEFAULT_INSTAGRAM_URL,
  DEFAULT_INSTAGRAM_HANDLE,
  DEFAULT_WIFI_SSID,
  DEFAULT_WIFI_PASSWORD,
  DEFAULT_CREDENTIAL_EVENT,
  DEFAULT_CREDENTIALS,
  type CredentialEntry,
} from "@/lib/print-data";

type Tab =
  | "qr-wifi"
  | "qr-discord"
  | "qr-instagram"
  | "sign-banos"
  | "sign-entrada"
  | "cronograma"
  | "menu"
  | "credencial";

const TAB_LABELS: Record<Tab, string> = {
  "qr-wifi":      "QR Wifi",
  "qr-discord":   "QR Discord",
  "qr-instagram": "QR Instagram",
  "sign-banos":   "Baños →",
  "sign-entrada": "Entrada Open-Duo",
  cronograma:     "Cronograma",
  menu:           "Menú",
  credencial:     "Credenciales",
};

const TAB_ORDER: Tab[] = [
  "qr-wifi",
  "qr-discord",
  "qr-instagram",
  "sign-banos",
  "sign-entrada",
  "cronograma",
  "menu",
  "credencial",
];

export default function PrintPage() {
  const [tab, setTab] = useState<Tab>("qr-wifi");

  // QR Wifi
  const [wifiSsid, setWifiSsid] = useState(DEFAULT_WIFI_SSID);
  const [wifiPassword, setWifiPassword] = useState(DEFAULT_WIFI_PASSWORD);

  // QR Discord (no handle — link único)
  const [discordUrl, setDiscordUrl] = useState(DEFAULT_DISCORD_URL);

  // QR Instagram
  const [instagramUrl, setInstagramUrl] = useState(DEFAULT_INSTAGRAM_URL);
  const [instagramHandle, setInstagramHandle] = useState(DEFAULT_INSTAGRAM_HANDLE);

  // Sign Baños
  const [banosArrow, setBanosArrow] = useState<ArrowDir>("right");

  // Sign Entrada
  const [entradaTitle, setEntradaTitle] = useState("ENTRADA");
  const [entradaSubtitle, setEntradaSubtitle] = useState("Open-Duo");

  // Cronograma
  const [cronoTitle, setCronoTitle] = useState("OPEN DUO");
  const [cronoDate, setCronoDate] = useState("Sábado 25 de Abril");
  const [cronoVenue, setCronoVenue] = useState("MiradorTec — Paraná");
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(OPEN_DUO_SCHEDULE);

  // Menú
  const [menuTitle, setMenuTitle] = useState("MENÚ DE EVENTO");
  const [menuSubtitle, setMenuSubtitle] = useState("OPEN DUO — EDICIÓN ESPECIAL");
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(OPEN_DUO_MENU_LABELS_ONLY);
  const [menuSponsorLogo, setMenuSponsorLogo] = useState<string | undefined>(undefined);

  // Credenciales
  const [credEvent, setCredEvent] = useState(DEFAULT_CREDENTIAL_EVENT);
  const [credentials, setCredentials] = useState<CredentialEntry[]>(DEFAULT_CREDENTIALS);
  const [activeCredId, setActiveCredId] = useState(DEFAULT_CREDENTIALS[0].id);
  const activeCred = credentials.find((c) => c.id === activeCredId) ?? credentials[0];
  const [credLayout, setCredLayout] = useState<"single" | "sheet">("single");

  // Preview — independent zoom per format so switching A6 ↔ A4 keeps each
  // format at a comfortable size.
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [zoomByFormat, setZoomByFormat] = useState<Record<string, number>>({
    "print-a6-portrait": 0.5,
    "print-a4-landscape": 0.22,
    "print-a4-portrait": 0.28,
    "print-a7-landscape": 0.5,
  });

  const { format, render, downloadName } = useMemo(() => {
    switch (tab) {
      case "qr-wifi": {
        const hasPassword = wifiPassword.length > 0;
        const handle = wifiSsid;
        const subtitle = hasPassword ? "Escaneá para conectarte." : "Red abierta — escaneá para conectarte.";
        return {
          format: FORMATS["print-a6-portrait"],
          downloadName: "qr-wifi",
          render: () => (
            <QrSign
              handle={handle}
              subtitle={subtitle}
              value={buildWifiPayload(wifiSsid, wifiPassword, hasPassword ? "WPA" : "nopass")}
              centerIcon={<WifiIcon />}
              accent="purple"
            />
          ),
        };
      }
      case "qr-discord":
        return {
          format: FORMATS["print-a6-portrait"],
          downloadName: "qr-discord",
          render: () => (
            <QrSign
              handle="Sumate al Discord"
              subtitle="Comunidad, partidas y anuncios del próximo torneo."
              value={discordUrl}
              centerIcon={<DiscordIcon />}
              accent="purple"
            />
          ),
        };
      case "qr-instagram":
        return {
          format: FORMATS["print-a6-portrait"],
          downloadName: "qr-instagram",
          render: () => (
            <QrSign
              handle={instagramHandle}
              subtitle="Seguinos en Instagram."
              value={instagramUrl}
              centerIcon={<InstagramIcon />}
              accent="pink"
            />
          ),
        };
      case "sign-banos":
        return {
          format: FORMATS["print-a4-landscape"],
          downloadName: "sign-banos",
          render: () => (
            <WaySign
              title="BAÑOS"
              arrow={banosArrow}
              showLogo={false}
              accent="purple"
            />
          ),
        };
      case "sign-entrada":
        return {
          format: FORMATS["print-a4-landscape"],
          downloadName: "sign-entrada",
          render: () => (
            <WaySign
              title={entradaTitle}
              subtitle={entradaSubtitle || undefined}
              arrow="none"
              showLogo
              accent="green"
            />
          ),
        };
      case "cronograma":
        return {
          format: FORMATS["print-a4-portrait"],
          downloadName: "cronograma",
          render: () => (
            <Cronograma
              eventTitle={cronoTitle}
              date={cronoDate}
              venue={cronoVenue || undefined}
              items={scheduleItems}
            />
          ),
        };
      case "menu":
        return {
          format: FORMATS["print-a4-landscape"],
          downloadName: "menu",
          render: () => (
            <MenuGastronomico
              eventTitle={menuTitle}
              eventSubtitle={menuSubtitle || undefined}
              sponsorLogoUrl={menuSponsorLogo}
              categories={menuCategories}
            />
          ),
        };
      case "credencial": {
        const slug = activeCred?.name.toLowerCase().replace(/\s+/g, "-") || "en-blanco";
        if (credLayout === "sheet") {
          return {
            format: FORMATS["print-a4-portrait"],
            downloadName: `credenciales-hoja-${slug}`,
            render: () =>
              activeCred ? (
                <CredentialSheet
                  name={activeCred.name}
                  eventTitle={credEvent}
                  accent={activeCred.accent}
                />
              ) : null,
          };
        }
        return {
          format: FORMATS["print-a7-landscape"],
          downloadName: `credencial-${slug}`,
          render: () =>
            activeCred ? (
              <StaffCredential
                name={activeCred.name}
                eventTitle={credEvent}
                accent={activeCred.accent}
              />
            ) : null,
        };
      }
    }
  }, [
    tab,
    wifiSsid, wifiPassword,
    discordUrl,
    instagramUrl, instagramHandle,
    banosArrow,
    entradaTitle, entradaSubtitle,
    cronoTitle, cronoDate, cronoVenue, scheduleItems,
    menuTitle, menuSubtitle, menuCategories, menuSponsorLogo,
    credEvent, activeCred, credLayout,
  ]);

  const scale = zoomByFormat[format.id] ?? 0.22;
  const setScale = (v: number) =>
    setZoomByFormat((z) => ({ ...z, [format.id]: v }));
  const previewW = format.width * scale;
  const previewH = format.height * scale;

  return (
    <div style={{ minHeight: "100vh", background: "#15151c", color: "#e8e8ee", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #25252e" }}>
        <div>
          <Link href="/" style={{ color: "#9a9aa6", fontSize: 14, textDecoration: "none" }}>← Galería</Link>
          <h1 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 600 }}>Señalética & impresos</h1>
          <p style={{ margin: "4px 0 0", color: "#9a9aa6", fontSize: 13 }}>
            Tamaños reales en mm. Exportá PNG e imprimí — sin retículas finas.
          </p>
        </div>
        <button
          onClick={() => previewRef.current && exportBanner(previewRef.current, downloadName)}
          style={{
            padding: "10px 20px",
            background: "#84C552",
            border: "none",
            borderRadius: 6,
            color: "#0a0a12",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ↓ Descargar PNG
        </button>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "16px 32px", borderBottom: "1px solid #25252e", flexWrap: "wrap" }}>
        {TAB_ORDER.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 16px",
              background: tab === t ? "#B339C4" : "transparent",
              border: `1px solid ${tab === t ? "#B339C4" : "#3a3a44"}`,
              borderRadius: 6,
              color: tab === t ? "white" : "#c8c8d2",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="print-layout">
        {/* Editor */}
        <aside className="print-aside" style={{ borderRight: "1px solid #25252e", padding: 24, overflowY: "auto" }}>
          {tab === "qr-wifi" && (
            <Editor>
              <FieldText label="SSID (red)" value={wifiSsid} onChange={setWifiSsid} />
              <FieldText label="Contraseña" value={wifiPassword} onChange={setWifiPassword} />
              <Hint>El QR auto-conecta al escanear (formato WPA).</Hint>
            </Editor>
          )}
          {tab === "qr-discord" && (
            <Editor>
              <FieldText label="URL Discord" value={discordUrl} onChange={setDiscordUrl} />
              <Hint>Link único de invitación. El QR lleva directo al server.</Hint>
            </Editor>
          )}
          {tab === "qr-instagram" && (
            <Editor>
              <FieldText label="URL Instagram" value={instagramUrl} onChange={setInstagramUrl} />
              <FieldText label="Handle visible" value={instagramHandle} onChange={setInstagramHandle} />
            </Editor>
          )}
          {tab === "sign-banos" && (
            <Editor>
              <FieldSelect
                label="Dirección de la flecha"
                value={banosArrow}
                onChange={(v) => setBanosArrow(v as ArrowDir)}
                options={[
                  { value: "right", label: "→ Derecha" },
                  { value: "left", label: "← Izquierda" },
                  { value: "up", label: "↑ Arriba" },
                  { value: "down", label: "↓ Abajo" },
                  { value: "none", label: "Sin flecha" },
                ]}
              />
            </Editor>
          )}
          {tab === "sign-entrada" && (
            <Editor>
              <FieldText label="Título" value={entradaTitle} onChange={setEntradaTitle} />
              <FieldText label="Subtítulo" value={entradaSubtitle} onChange={setEntradaSubtitle} />
            </Editor>
          )}
          {tab === "cronograma" && (
            <Editor>
              <FieldText label="Evento" value={cronoTitle} onChange={setCronoTitle} />
              <FieldText label="Fecha" value={cronoDate} onChange={setCronoDate} />
              <FieldText label="Lugar" value={cronoVenue} onChange={setCronoVenue} />
              <ScheduleEditor items={scheduleItems} onChange={setScheduleItems} />
            </Editor>
          )}
          {tab === "menu" && (
            <Editor>
              <FieldText label="Título" value={menuTitle} onChange={setMenuTitle} />
              <FieldText label="Subtítulo" value={menuSubtitle} onChange={setMenuSubtitle} />
              <SponsorLogoField value={menuSponsorLogo} onChange={setMenuSponsorLogo} />
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                <SmallBtn onClick={() => setMenuCategories(OPEN_DUO_MENU_LABELS_ONLY)}>
                  Etiquetas + blanco
                </SmallBtn>
                <SmallBtn onClick={() => setMenuCategories(OPEN_DUO_MENU)}>
                  Con precios
                </SmallBtn>
                <SmallBtn onClick={() => setMenuCategories(OPEN_DUO_MENU_BLANK)}>
                  Todo en blanco
                </SmallBtn>
              </div>
              <Hint>
                3 modos por item según los campos: etiqueta + monto = chip lleno · solo etiqueta = chip + recuadro blanco para escribir a mano · sin nada = recuadro completamente en blanco.
              </Hint>
              <MenuEditor categories={menuCategories} onChange={setMenuCategories} />
            </Editor>
          )}
          {tab === "credencial" && (
            <Editor>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#9a9aa6", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Salida
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {([
                    { id: "single", label: "Credencial A7" },
                    { id: "sheet", label: "Hoja A4 (×8)" },
                  ] as const).map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setCredLayout(o.id)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: credLayout === o.id ? "#B339C4" : "transparent",
                        border: `1px solid ${credLayout === o.id ? "#B339C4" : "#3a3a44"}`,
                        borderRadius: 6,
                        color: credLayout === o.id ? "#fff" : "#c8c8d2",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: credLayout === o.id ? 600 : 400,
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <FieldText label="Evento" value={credEvent} onChange={setCredEvent} />
              <CredentialEditor
                credentials={credentials}
                activeId={activeCredId}
                onSelect={setActiveCredId}
                onChange={setCredentials}
              />
              <Hint>
                A7 horizontal (105×74mm). Dejá el nombre vacío para imprimir una línea y escribirlo a mano. El recuadro punteado superior es la guía de troquelado para el cordón. La opción «Hoja A4 (×8)» repite la credencial seleccionada 8 veces con márgenes y líneas punteadas de corte.
              </Hint>
            </Editor>
          )}
        </aside>

        {/* Preview */}
        <main style={{ display: "flex", flexDirection: "column", overflow: "auto", padding: 24, alignItems: "center" }}>
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "#9a9aa6" }}>
            <span>{format.name} · {format.width}×{format.height}px</span>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Zoom
              <input
                type="range"
                min={0.05}
                max={0.5}
                step={0.01}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
              <span>{Math.round(scale * 100)}%</span>
            </label>
          </div>
          <div
            style={{
              width: previewW,
              height: previewH,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: format.width,
                height: format.height,
              }}
            >
              {render()}
            </div>
          </div>
        </main>
      </div>

      {/* ── Hidden export source — full size, no transform ──
           html-to-image inherits CSS transforms from the captured node, so
           we render a second copy at native dimensions for the PNG export. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: -99999,
          top: -99999,
          pointerEvents: "none",
          width: format.width,
          height: format.height,
        }}
      >
        <div ref={previewRef} style={{ width: format.width, height: format.height }}>
          {render()}
        </div>
      </div>
    </div>
  );
}

// ─── form primitives ────────────────────────────────────────────────────

function Editor({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>;
}

function SponsorLogoField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const handle = (file: File | null) => {
    if (!file) return onChange(undefined);
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "#9a9aa6", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Logo del emprendimiento (opcional)
      </span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {value && (
          <div
            style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "#fff", flexShrink: 0, overflow: "hidden",
              border: "1px solid #2e2e38",
            }}
          >
            <img src={value} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <label
          style={{
            flex: 1, padding: "8px 10px",
            background: "#1e1e26", border: "1px solid #2e2e38", borderRadius: 4,
            color: "#9a9aa6", fontSize: 12, cursor: "pointer", textAlign: "center",
          }}
        >
          {value ? "↻ cambiar logo" : "↑ subir logo redondo"}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handle(e.target.files?.[0] ?? null)}
          />
        </label>
        {value && (
          <button
            onClick={() => onChange(undefined)}
            style={{
              padding: "6px 10px", background: "transparent",
              border: "1px solid #5a3030", borderRadius: 3, color: "#d06868",
              fontSize: 12, cursor: "pointer",
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

function FieldText({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, color: "#9a9aa6", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 12px",
          background: "#1e1e26",
          border: "1px solid #2e2e38",
          borderRadius: 4,
          color: "#e8e8ee",
          fontSize: 13,
          fontFamily: "inherit",
        }}
      />
    </label>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, color: "#9a9aa6", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 12px",
          background: "#1e1e26",
          border: "1px solid #2e2e38",
          borderRadius: 4,
          color: "#e8e8ee",
          fontSize: 13,
          fontFamily: "inherit",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, color: "#7a7a86", margin: 0 }}>{children}</p>;
}

function SmallBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 10px",
        background: "rgba(132,197,82,0.12)",
        border: "1px solid rgba(132,197,82,0.35)",
        borderRadius: 4,
        color: "#84C552",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ─── schedule editor ────────────────────────────────────────────────────

function ScheduleEditor({ items, onChange }: { items: ScheduleItem[]; onChange: (v: ScheduleItem[]) => void }) {
  const update = (i: number, patch: Partial<ScheduleItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { time: "00:00", label: "Nueva actividad", accent: "purple" }]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
      <div style={{ fontSize: 12, color: "#9a9aa6", textTransform: "uppercase", letterSpacing: "0.08em" }}>Items</div>
      {items.map((it, i) => (
        <div key={i} style={{ background: "#1e1e26", border: "1px solid #2e2e38", borderRadius: 6, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={it.time}
              onChange={(e) => update(i, { time: e.target.value })}
              style={{ width: 80, padding: "6px 8px", background: "#15151c", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12 }}
            />
            <input
              value={it.label}
              onChange={(e) => update(i, { label: e.target.value })}
              style={{ flex: 1, padding: "6px 8px", background: "#15151c", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12 }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <select
              value={it.accent ?? "purple"}
              onChange={(e) => update(i, { accent: e.target.value as ScheduleItem["accent"] })}
              style={{ flex: 1, padding: "6px 8px", background: "#15151c", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12 }}
            >
              <option value="purple">Púrpura</option>
              <option value="green">Verde</option>
              <option value="orange">Naranja</option>
            </select>
            <button
              onClick={() => remove(i)}
              style={{ padding: "6px 10px", background: "transparent", border: "1px solid #5a3030", borderRadius: 3, color: "#d06868", fontSize: 12, cursor: "pointer" }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <SmallBtn onClick={add}>+ Agregar item</SmallBtn>
    </div>
  );
}

// ─── menu editor ────────────────────────────────────────────────────────

// ─── credential editor ──────────────────────────────────────────────────

function CredentialEditor({
  credentials,
  activeId,
  onSelect,
  onChange,
}: {
  credentials: CredentialEntry[];
  activeId: string;
  onSelect: (id: string) => void;
  onChange: (v: CredentialEntry[]) => void;
}) {
  const update = (id: string, patch: Partial<CredentialEntry>) =>
    onChange(credentials.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: string) => {
    if (credentials.length === 1) return;
    const next = credentials.filter((c) => c.id !== id);
    onChange(next);
    if (id === activeId) onSelect(next[0].id);
  };
  const add = () => {
    const id = `cred-${Math.random().toString(36).slice(2, 8)}`;
    onChange([
      ...credentials,
      { id, name: "", accent: "purple" },
    ]);
    onSelect(id);
  };

  const accents: CredentialAccent[] = ["purple", "green", "orange", "pink"];
  const accentColor: Record<CredentialAccent, string> = {
    purple: "#B339C4", green: "#84C552", orange: "#FF8200", pink: "#E94B8B",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
      <div style={{ fontSize: 12, color: "#9a9aa6", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Credenciales ({credentials.length}) — seleccioná una para previsualizar
      </div>
      {credentials.map((c) => {
        const isActive = c.id === activeId;
        return (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              background: isActive ? "rgba(179,57,196,0.12)" : "#1e1e26",
              border: `1px solid ${isActive ? "#B339C4" : "#2e2e38"}`,
              borderRadius: 6,
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={c.name}
                onChange={(e) => update(c.id, { name: e.target.value })}
                placeholder="Nombre (vacío = línea para escribir a mano)"
                onClick={(e) => e.stopPropagation()}
                style={{ flex: 1, padding: "6px 8px", background: "#15151c", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12 }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); remove(c.id); }}
                disabled={credentials.length === 1}
                style={{ padding: "6px 10px", background: "transparent", border: "1px solid #5a3030", borderRadius: 3, color: "#d06868", fontSize: 12, cursor: credentials.length === 1 ? "not-allowed" : "pointer", opacity: credentials.length === 1 ? 0.4 : 1 }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {accents.map((acc) => (
                <button
                  key={acc}
                  onClick={(e) => { e.stopPropagation(); update(c.id, { accent: acc }); }}
                  title={acc}
                  style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: accentColor[acc],
                    border: c.accent === acc ? "2px solid #fff" : "2px solid transparent",
                    boxShadow: c.accent === acc ? "0 0 0 1px #2e2e38" : "none",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
      <SmallBtn onClick={add}>+ Agregar credencial</SmallBtn>
    </div>
  );
}

function MenuEditor({ categories, onChange }: { categories: MenuCategory[]; onChange: (v: MenuCategory[]) => void }) {
  const updateCat = (ci: number, patch: Partial<MenuCategory>) =>
    onChange(categories.map((c, i) => (i === ci ? { ...c, ...patch } : c)));
  const updateItem = (ci: number, ii: number, patch: Partial<MenuCategory["items"][number]>) =>
    onChange(
      categories.map((c, i) =>
        i === ci ? { ...c, items: c.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) } : c,
      ),
    );

  const handleImage = (ci: number, ii: number, file: File | null) => {
    if (!file) {
      updateItem(ci, ii, { imageUrl: undefined });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateItem(ci, ii, { imageUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
      {categories.map((cat, ci) => (
        <div key={ci} style={{ background: "#1e1e26", border: "1px solid #2e2e38", borderRadius: 6, padding: 12 }}>
          <input
            value={cat.title}
            onChange={(e) => updateCat(ci, { title: e.target.value })}
            style={{ width: "100%", padding: "6px 8px", background: "#15151c", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12, fontWeight: 600, marginBottom: 6 }}
          />
          <input
            value={cat.subtitle ?? ""}
            placeholder="(subtítulo)"
            onChange={(e) => updateCat(ci, { subtitle: e.target.value })}
            style={{ width: "100%", padding: "6px 8px", background: "#15151c", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12, marginBottom: 10 }}
          />
          {cat.items.map((it, ii) => (
            <div key={ii} style={{ background: "#15151c", border: "1px solid #2e2e38", borderRadius: 4, padding: 8, marginBottom: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <input
                value={it.name}
                onChange={(e) => updateItem(ci, ii, { name: e.target.value })}
                placeholder="Nombre"
                style={{ padding: "5px 8px", background: "#0a0a12", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12 }}
              />
              <textarea
                value={it.description}
                onChange={(e) => updateItem(ci, ii, { description: e.target.value })}
                placeholder="Descripción"
                rows={2}
                style={{ padding: "5px 8px", background: "#0a0a12", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12, fontFamily: "inherit", resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  value={it.priceLabel ?? ""}
                  onChange={(e) => updateItem(ci, ii, { priceLabel: e.target.value || undefined })}
                  placeholder="Etiqueta (PRECIO POR UNIDAD)"
                  style={{ flex: 2, padding: "5px 8px", background: "#0a0a12", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12 }}
                />
                <input
                  value={it.priceAmount ?? ""}
                  onChange={(e) => updateItem(ci, ii, { priceAmount: e.target.value || undefined })}
                  placeholder="$ (vacío = en blanco)"
                  style={{ flex: 1, padding: "5px 8px", background: "#0a0a12", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12 }}
                />
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <select
                  value={it.bgAccent}
                  onChange={(e) => updateItem(ci, ii, { bgAccent: e.target.value as MenuAccent })}
                  style={{ padding: "5px 8px", background: "#0a0a12", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 12 }}
                >
                  <option value="orange">Naranja</option>
                  <option value="green">Verde</option>
                  <option value="purple">Púrpura</option>
                </select>
                <input
                  value={it.emoji ?? ""}
                  onChange={(e) => updateItem(ci, ii, { emoji: e.target.value || undefined })}
                  placeholder="Emoji"
                  maxLength={4}
                  style={{ width: 60, padding: "5px 8px", background: "#0a0a12", border: "1px solid #2e2e38", borderRadius: 3, color: "#e8e8ee", fontSize: 14, textAlign: "center" }}
                />
                <label style={{ flex: 1, padding: "5px 8px", background: "#0a0a12", border: "1px solid #2e2e38", borderRadius: 3, color: "#9a9aa6", fontSize: 11, cursor: "pointer", textAlign: "center" }}>
                  {it.imageUrl ? "↻ cambiar foto" : "↑ subir foto"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleImage(ci, ii, e.target.files?.[0] ?? null)}
                  />
                </label>
                {it.imageUrl && (
                  <button
                    onClick={() => updateItem(ci, ii, { imageUrl: undefined })}
                    style={{ padding: "5px 8px", background: "transparent", border: "1px solid #5a3030", borderRadius: 3, color: "#d06868", fontSize: 11, cursor: "pointer" }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

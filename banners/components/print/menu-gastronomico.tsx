"use client";

export type MenuAccent = "purple" | "green" | "orange";

/** A single bulleted variant — bold name + optional plain detail. */
export interface MenuVariant {
  /** Bold leading text, e.g. "Clásicas", "Zanahoria" */
  bold: string;
  /** Rest of the line in normal weight, e.g. "(chocolate chip)," */
  rest?: string;
}

export interface MenuItem {
  /** Display name, italic style — e.g. "Muffins proteicos" */
  name: string;
  /** ALL-CAPS title shown above the body, e.g. "MUFFINS PROTEICOS:" */
  capsTitle: string;
  /** Plain-text body when there are no variants. */
  description?: string;
  /** Bulleted variants (used by Cookies, Budines, etc.). When present, takes
   * precedence over `description`. */
  variants?: MenuVariant[];
  /** Price label, e.g. "PRECIO POR UNIDAD". Always shown when present. */
  priceLabel?: string;
  /**
   * Numeric portion of the price, e.g. "$2000". Optional.
   * - Both → solid green chip with full text.
   * - Label only → single-line chip with label on the left and white blank on the right for hand-writing.
   * - Neither → fully blank dashed rectangle.
   */
  priceAmount?: string;
  /** Optional uploaded image (data URL) */
  imageUrl?: string;
  /** Single emoji fallback shown inside the colored circle when no image */
  emoji?: string;
  /** Accent color for the circular image background */
  bgAccent: MenuAccent;
}

export interface MenuCategory {
  /** AZONIX header */
  title: string;
  /** Italic subtitle in parentheses */
  subtitle?: string;
  items: MenuItem[];
}

export interface MenuGastronomicoProps {
  eventTitle: string;
  /** e.g. "OPEN DUO — EDICIÓN ESPECIAL" */
  eventSubtitle?: string;
  /** Optional emprendimiento / sponsor logo (data URL). Renders as a round
   * mark on the top-right of the header. GamER mark stays at top-left. */
  sponsorLogoUrl?: string;
  categories: MenuCategory[];
}

const ACCENT_BG: Record<MenuAccent, string> = {
  purple: "#B339C4",
  green:  "#84C552",
  orange: "#FF8200",
};
const ACCENT_GLOW: Record<MenuAccent, string> = {
  purple: "rgba(179,57,196,0.55)",
  green:  "rgba(132,197,82,0.55)",
  orange: "rgba(255,130,0,0.55)",
};

/**
 * A4 horizontal (297×210mm @300dpi = 3508×2480px) event food menu.
 *
 * Visual hierarchy: items first, brand second.
 * - Compact header strip: small GamER mark left, condensed title centered,
 *   optional sponsor circle right.
 * - Item images are restrained (320px circles) — descriptions and prices
 *   carry more weight.
 * - Single-line price chips: label on the left, white blank on the right
 *   for hand-written amounts (when `priceAmount` is left empty).
 */
export function MenuGastronomico({
  eventTitle,
  eventSubtitle,
  sponsorLogoUrl,
  categories,
}: MenuGastronomicoProps) {
  const W = 3508;
  const H = 2480;

  return (
    <div
      className="banner-frame"
      style={{
        position: "relative",
        width: W,
        height: H,
        background: "#0a0a12",
        overflow: "hidden",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Big radial glows */}
      <div style={{ position: "absolute", top: -700, left: -700, width: 2200, height: 2200, borderRadius: "50%", background: "radial-gradient(circle, rgba(179,57,196,0.30) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -800, right: -800, width: 2400, height: 2400, borderRadius: "50%", background: "radial-gradient(circle, rgba(132,197,82,0.18) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 600, right: -200, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,130,0,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Top diagonal stripe band */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: 1200, height: 240,
          background: `repeating-linear-gradient(45deg, transparent, transparent 28px, #84C552 28px, #84C552 36px)`,
          opacity: 0.18,
          pointerEvents: "none",
        }}
      />

      <HudBracket pos="tl" color="#B339C4" />
      <HudBracket pos="tr" color="#B339C4" />
      <HudBracket pos="bl" color="#84C552" />
      <HudBracket pos="br" color="#84C552" />

      {/* ── Header strip — GamER · title · big sponsor ── */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "90px 220px 20px",
          gap: 60,
          flexShrink: 0,
        }}
      >
        {/* GamER mark — secondary, small */}
        <img src="/logo.png" alt="GamER" style={{ height: 130, width: "auto", flexShrink: 0 }} />

        {/* Title block — centered, condensed */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            className="font-azonix"
            style={{
              fontSize: 140,
              letterSpacing: "0.04em",
              lineHeight: 1,
              color: "#ffffff",
              textTransform: "uppercase",
              textShadow: "0 0 20px rgba(179,57,196,0.45)",
            }}
          >
            {eventTitle}
          </div>
          {eventSubtitle && (
            <div
              className="font-azonix"
              style={{
                marginTop: 18,
                fontSize: 56,
                letterSpacing: "0.3em",
                color: "#84C552",
                textTransform: "uppercase",
              }}
            >
              {eventSubtitle}
            </div>
          )}
        </div>

        {/* Sponsor logo slot — large round mark on the right (matches the
            reference's "espacio para tu logo redondo"). When no logo, an
            invisible spacer of equal width keeps the title centered. */}
        {sponsorLogoUrl ? (
          <div
            style={{
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "#ffffff",
              border: "10px solid #ffffff",
              boxShadow: "0 0 50px rgba(255,255,255,0.22)",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={sponsorLogoUrl}
              alt="Sponsor"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div style={{ width: 130, height: 1, flexShrink: 0 }} />
        )}
      </div>

      {/* ── Body: category columns. Items flow naturally from the top —
           prices sit immediately under their descriptions, no dead space
           in the visual center. Empty space falls below the items. ── */}
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          padding: "50px 220px 50px",
          gap: 90,
          minHeight: 0,
        }}
      >
        {categories.map((cat, ci) => (
          <CategoryColumn key={ci} category={cat} />
        ))}
      </div>

      {/* Bottom mark */}
      <div
        className="font-azonix"
        style={{
          textAlign: "center",
          fontSize: 32,
          letterSpacing: "0.5em",
          color: "#5a5a66",
          paddingBottom: 50,
          flexShrink: 0,
        }}
      >
        ENTRE RÍOS GAMERS
      </div>
    </div>
  );
}

function CategoryColumn({ category }: { category: MenuCategory }) {
  const cols = category.items.length;
  return (
    <div
      style={{
        flex: cols,
        display: "flex",
        flexDirection: "column",
        gap: 30,
        minWidth: 0,
      }}
    >
      <div style={{ textAlign: "center", paddingBottom: 10 }}>
        <div
          className="font-azonix"
          style={{
            fontSize: 80,
            letterSpacing: "0.04em",
            color: "#ffffff",
            lineHeight: 1.05,
            textTransform: "uppercase",
            textShadow: "0 0 16px rgba(179,57,196,0.45)",
          }}
        >
          {category.title}
        </div>
        {category.subtitle && (
          <div
            style={{
              marginTop: 14,
              fontStyle: "italic",
              fontSize: 46,
              color: "#84C552",
            }}
          >
            ({category.subtitle})
          </div>
        )}
      </div>

      {/* Items row — natural height (no flex grow on items), align tops. */}
      <div style={{ display: "flex", gap: 36, alignItems: "flex-start", minHeight: 0 }}>
        {category.items.map((item, i) => (
          <ItemCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: MenuItem }) {
  const bg = ACCENT_BG[item.bgAccent];
  const glow = ACCENT_GLOW[item.bgAccent];
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
        minWidth: 0,
      }}
    >
      {/* Circular image — complements, doesn't dominate */}
      <div
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxShadow: `0 0 50px ${glow}, 0 0 100px ${glow}`,
          border: `4px solid ${bg}`,
          flexShrink: 0,
        }}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : item.emoji ? (
          <div style={{ fontSize: 180, lineHeight: 1 }}>{item.emoji}</div>
        ) : (
          <div style={{ fontStyle: "italic", color: "rgba(255,255,255,0.85)", fontSize: 28, padding: 24, textAlign: "center" }}>
            (foto pendiente)
          </div>
        )}
      </div>

      {/* Italic name */}
      <div
        style={{
          fontStyle: "italic",
          fontSize: 64,
          fontWeight: 600,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        {item.name}
      </div>

      {/* Body block — caps title + description / bullets. Natural height. */}
      <div style={{ alignSelf: "stretch", minWidth: 0 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 52,
            color: "#ffffff",
            letterSpacing: "0.02em",
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          {item.capsTitle}
        </div>
        {item.variants && item.variants.length > 0 ? (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {item.variants.map((v, i) => (
              <li
                key={i}
                style={{
                  fontSize: 48,
                  color: "#e0e0ea",
                  lineHeight: 1.3,
                  paddingLeft: 46,
                  position: "relative",
                }}
              >
                <span style={{ position: "absolute", left: 0, top: 0, color: "#84C552", fontWeight: 700, fontSize: 48 }}>•</span>
                <span style={{ fontWeight: 700, color: "#ffffff" }}>{v.bold}</span>
                {v.rest ? <span> {v.rest}</span> : null}
              </li>
            ))}
          </ul>
        ) : item.description ? (
          <div style={{ fontSize: 50, color: "#e0e0ea", lineHeight: 1.3 }}>
            {item.description}
          </div>
        ) : null}
      </div>

      {/* Price — sits right under the description, no flex stretch above it. */}
      <div style={{ alignSelf: "stretch", marginTop: 8 }}>
        <PriceBlock label={item.priceLabel} amount={item.priceAmount} />
      </div>
    </div>
  );
}

function PriceBlock({ label, amount }: { label?: string; amount?: string }) {
  // Mode 1: solid green chip with full text in one line.
  if (label && amount) {
    return (
      <div
        className="font-azonix panel-clip-sm"
        style={{
          background: "#84C552",
          color: "#0a0a12",
          padding: "22px 28px",
          fontSize: 38,
          letterSpacing: "0.06em",
          textAlign: "center",
          width: "100%",
          boxShadow: "0 0 30px rgba(132,197,82,0.5)",
          fontWeight: 800,
        }}
      >
        {label} {amount}
      </div>
    );
  }
  // Mode 2: single-line chip — label on the left (~⅔ width), white blank
  // on the right (~⅓ width) for hand-writing the amount. Font sized so
  // the longest expected label ("PRECIO POR PORCIÓN", 18 chars) fits.
  if (label) {
    return (
      <div
        className="panel-clip-sm"
        style={{
          background: "#84C552",
          width: "100%",
          height: 100,
          display: "flex",
          alignItems: "center",
          padding: "0 18px 0 24px",
          gap: 16,
          boxShadow: "0 0 28px rgba(132,197,82,0.45)",
        }}
      >
        <div
          className="font-azonix"
          style={{
            flex: 2,
            minWidth: 0,
            color: "#0a0a12",
            fontSize: 26,
            letterSpacing: "0.03em",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {label}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: 70,
            background: "#ffffff",
            borderRadius: 6,
          }}
        />
      </div>
    );
  }
  // Mode 3: fully blank dashed rectangle.
  return (
    <div
      style={{
        background: "#ffffff",
        border: "4px dashed rgba(255,255,255,0.4)",
        borderRadius: 10,
        height: 110,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#aaaab4",
        fontSize: 26,
        fontStyle: "italic",
        letterSpacing: "0.1em",
      }}
    >
      precio
    </div>
  );
}

function HudBracket({ pos, color }: { pos: "tl" | "tr" | "bl" | "br"; color: string }) {
  const size = 280;
  const thick = 16;
  const inset = 100;
  const styles: React.CSSProperties = { position: "absolute", width: size, height: size, pointerEvents: "none" };
  if (pos === "tl") { styles.top = inset; styles.left = inset; styles.borderTop = `${thick}px solid ${color}`; styles.borderLeft = `${thick}px solid ${color}`; }
  else if (pos === "tr") { styles.top = inset; styles.right = inset; styles.borderTop = `${thick}px solid ${color}`; styles.borderRight = `${thick}px solid ${color}`; }
  else if (pos === "bl") { styles.bottom = inset; styles.left = inset; styles.borderBottom = `${thick}px solid ${color}`; styles.borderLeft = `${thick}px solid ${color}`; }
  else { styles.bottom = inset; styles.right = inset; styles.borderBottom = `${thick}px solid ${color}`; styles.borderRight = `${thick}px solid ${color}`; }
  return <div style={styles} />;
}

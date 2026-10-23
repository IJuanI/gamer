"use client";

import { toPng } from "html-to-image";
import JSZip from "jszip";

/** Output resolution multiplier. 1x is the flyer's native size (1080 px wide for Stories). */
export type ExportScale = 1 | 2 | 4;
export const EXPORT_SCALES: ExportScale[] = [1, 2, 4];

export { BG_LAYER } from "@/lib/flyer-kinds";
import { BG_LAYER } from "@/lib/flyer-kinds";

function download(href: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = href;
  link.click();
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  download(url, name);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Export a flyer DOM node as a PNG at the chosen scale. */
export async function exportFlyer(node: HTMLElement, filename = "gamer-flyer", scale: ExportScale = 1): Promise<void> {
  const dataUrl = await toPng(node, {
    width: node.offsetWidth,
    height: node.offsetHeight,
    pixelRatio: scale,
    cacheBust: true,
  });
  download(dataUrl, `${filename}-${scale}x.png`);
}

/**
 * Renders one layer of the flyer as a separate PNG. The flyer is cloned into an off-screen
 * container so the live preview is untouched. `keep` decides which direct children stay.
 */
async function renderLayer(root: HTMLElement, layer: "base" | "decor" | "content", scale: number): Promise<Blob> {
  const clone = root.cloneNode(true) as HTMLElement;
  const decor = `[data-export-layer="${BG_LAYER}"]`;
  if (layer === "base") {
    clone.replaceChildren();
  } else if (layer === "decor") {
    const kept = clone.querySelector(decor);
    clone.replaceChildren(...(kept ? [kept] : []));
    clone.style.background = "transparent";
  } else {
    clone.querySelectorAll(decor).forEach((el) => el.remove());
    clone.style.background = "transparent";
  }

  const holder = document.createElement("div");
  holder.style.cssText = `position:fixed;top:0;left:-99999px;width:${root.offsetWidth}px;height:${root.offsetHeight}px;`;
  holder.appendChild(clone);
  document.body.appendChild(holder);
  try {
    const dataUrl = await toPng(clone, {
      width: root.offsetWidth,
      height: root.offsetHeight,
      pixelRatio: scale,
      cacheBust: true,
    });
    return await (await fetch(dataUrl)).blob();
  } finally {
    holder.remove();
  }
}

/** Fetches a file from the app's own origin or a CDN. Returns null when the request fails. */
async function fetchFile(src: string): Promise<{ data: Blob; ext: string } | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const ext = (src.split("?")[0].split(".").pop() ?? "bin").toLowerCase();
    return { data: await res.blob(), ext };
  } catch {
    return null;
  }
}

/** Font-face sources from the page's stylesheets. Cross-origin sheets are read through fetch instead. */
const REMOTE_FONT_CSS = ["https://fonts.cdnfonts.com/css/azonix"];

async function collectFonts(): Promise<{ files: { name: string; data: Blob }[]; sources: string[] }> {
  const found = new Map<string, string>();
  const addFromCss = (css: string) => {
    for (const rule of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
      const family = /font-family:\s*['"]?([^'";]+)/.exec(rule[1])?.[1]?.trim() ?? "fuente";
      for (const m of rule[1].matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
        if (!found.has(m[1])) found.set(m[1], family);
      }
    }
  };

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSFontFaceRule) addFromCss(rule.cssText);
      }
    } catch {
      // Cross-origin sheet: handled below.
    }
  }
  for (const url of REMOTE_FONT_CSS) {
    try {
      addFromCss(await (await fetch(url)).text());
    } catch {
      // Keep going. The sources file lists it for manual download.
    }
  }

  const files: { name: string; data: Blob }[] = [];
  const sources: string[] = [];
  for (const [url, family] of found) {
    const file = await fetchFile(new URL(url, document.baseURI).href);
    const safe = family.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
    if (file) {
      files.push({ name: `${safe}-${files.length + 1}.${file.ext}`, data: file.data });
    } else {
      sources.push(`${family}: ${url}`);
    }
  }
  return { files, sources };
}

export interface DesignElementsInput {
  node: HTMLElement;
  filename: string;
  /** Logo paths or data URLs that belong to the flyer (brand logo, title image, venue logo). */
  logos: { name: string; src: string }[];
}

/**
 * Downloads every design resource of a flyer as a zip at 2x: the base colour, the background
 * decoration, the foreground content, the logos and the fonts.
 */
export async function exportDesignElements({ node, filename, logos }: DesignElementsInput): Promise<void> {
  const root = (node.firstElementChild as HTMLElement | null) ?? node;
  const scale = 2;
  const zip = new JSZip();

  zip.file("01-fondo-base.png", await renderLayer(root, "base", scale));
  zip.file("02-elementos-fondo.png", await renderLayer(root, "decor", scale));
  zip.file("03-elementos-frente.png", await renderLayer(root, "content", scale));

  const logoFolder = zip.folder("logos");
  for (const logo of logos) {
    const file = await fetchFile(logo.src);
    if (file) logoFolder?.file(`${logo.name}.${file.ext}`, file.data);
  }

  const fontFolder = zip.folder("fuentes");
  const fonts = await collectFonts();
  for (const f of fonts.files) fontFolder?.file(f.name, f.data);
  const readme = [
    "Elementos de diseño del flyer (exportados a 2x)",
    "",
    "01-fondo-base.png        Color de fondo de la marca, sin elementos.",
    "02-elementos-fondo.png   Decoración del fondo (motivos, anillos, patrones), sobre transparencia.",
    "03-elementos-frente.png  Contenido: textos, bloques, lugar y fecha, sobre transparencia.",
    "logos/                   Logos usados por el flyer, tal como están en el sitio.",
    "fuentes/                 Archivos de fuente cargados por la página.",
    ...(fonts.sources.length ? ["", "Fuentes que no se pudieron descargar automáticamente:", ...fonts.sources] : []),
  ].join("\n");
  zip.file("LEEME.txt", readme);

  downloadBlob(await zip.generateAsync({ type: "blob" }), `${filename}-elementos-2x.zip`);
}

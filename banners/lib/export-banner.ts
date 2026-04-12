"use client";

import { toPng } from "html-to-image";

/**
 * Export a banner DOM element as a PNG file.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   <div ref={ref}><InstagramStory event={event} /></div>
 *   <button onClick={() => exportBanner(ref.current!, "mi-banner")}>Descargar</button>
 */
export async function exportBanner(
  node: HTMLElement,
  filename: string = "gamer-banner"
): Promise<void> {
  const dataUrl = await toPng(node, {
    width: node.offsetWidth,
    height: node.offsetHeight,
    pixelRatio: 1, // 1:1 pixel mapping — the component is already at target resolution
    cacheBust: true,
  });

  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}

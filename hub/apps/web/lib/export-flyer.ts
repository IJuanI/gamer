"use client";

import { toPng } from "html-to-image";

/** Export a flyer DOM node as a PNG file at its native resolution. */
export async function exportFlyer(node: HTMLElement, filename = "gamer-flyer"): Promise<void> {
  const dataUrl = await toPng(node, {
    width: node.offsetWidth,
    height: node.offsetHeight,
    pixelRatio: 1,
    cacheBust: true,
  });

  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}

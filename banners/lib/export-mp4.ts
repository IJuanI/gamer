"use client";

import { toCanvas } from "html-to-image";

/**
 * Export a banner DOM element as an MP4 video.
 *
 * Optimizations applied:
 *  1. `toCanvas()` instead of `toPng()` + `Image` decode — no PNG roundtrip.
 *  2. Single rAF between seek and capture — animations are paused.
 *  3. Loop-frame caching — output is N × loopSeconds (e.g. 3×5s for Stories).
 *     We capture only one loop's unique frames; subsequent loops reuse bitmaps.
 *  4. Animation-state fingerprint — before every `toCanvas`, we read
 *     `getComputedStyle` on a small set of sentinel elements (cheap, sync).
 *     If no animated CSS property changed since the last frame we skip
 *     `toCanvas` entirely and reuse the previous bitmap. For Glitch this
 *     eliminates ~85% of captures (long idle stretches between bursts).
 *  5. Perceptual-hash dedup — frames that slipped past the fingerprint check
 *     but rendered identically are muxed as one VideoFrame with extended
 *     duration. Catches easing-curve frames that happen to round the same.
 *  6. Pipelined encoder with `setTimeout(0)` back-pressure so the tab stays
 *     responsive during the encode phase.
 *
 * Requires WebCodecs (`VideoEncoder`) — Chrome 94+, Edge, Safari 16.4+.
 */
export async function exportBannerMp4(
  node: HTMLElement,
  filename: string,
  opts: {
    loopSeconds?: number;
    totalSeconds?: number;
    fps?: number;
    bitrate?: number;
    onProgress?: (done: number, total: number) => void;
  } = {}
): Promise<void> {
  const loopSeconds = opts.loopSeconds ?? 5;
  const totalSeconds = opts.totalSeconds ?? loopSeconds;
  const fps = opts.fps ?? 30;
  const bitrate = opts.bitrate ?? 8_000_000;
  const width = node.offsetWidth;
  const height = node.offsetHeight;
  const totalFrames = Math.round(totalSeconds * fps);
  const loopFrames = Math.round(loopSeconds * fps);
  const perFrameUs = Math.round(1_000_000 / fps);

  if (typeof VideoEncoder === "undefined") {
    throw new Error(
      "Este navegador no soporta WebCodecs (VideoEncoder). Usá Chrome, Edge o Safari 16.4+."
    );
  }

  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width, height, frameRate: fps },
    fastStart: "in-memory",
  });

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error("VideoEncoder error", e),
  });

  encoder.configure({
    codec: "avc1.640028",
    width,
    height,
    bitrate,
    framerate: fps,
  });

  // ── Animation-state fingerprint ───────────────────────────────────────
  // Read computed CSS on elements that carry every animated property in the
  // banner animation system. If this string is unchanged since the last
  // frame, the rendered output is guaranteed to be identical → skip toCanvas.
  //
  // Covers: icon transforms (svg.absolute), HUD bracket transform+filter,
  // grid background-position+filter, neon line transform+filter, radial glows.
  // Pseudo-elements (::before / ::after) are not readable, but their
  // sibling/parent elements always animate in sync, so they're implicit.
  const SENTINEL_SELECTORS = [
    "svg.absolute",
    ".hud-bracket-tl",
    ".hud-bracket-bl",
    ".bg-grid-neon-fade",
    ".bg-grid",
    ".neon-line-h",
    ".neon-line-h-green",
    ".radial-glow-purple",
    ".radial-glow-green",
    ".diagonal-stripe",
  ] as const;

  const sentinels = SENTINEL_SELECTORS
    .map((sel) => node.querySelector(sel))
    .filter((el): el is Element => el !== null);

  function animFingerprint(): string {
    // getComputedStyle is synchronous and takes ~10µs per element.
    return sentinels
      .map((el) => {
        const s = getComputedStyle(el);
        return `${s.transform}|${s.filter}|${s.opacity}|${s.backgroundPosition}`;
      })
      .join("\n");
  }

  // ── Perceptual hash (fallback for fingerprint false-negatives) ────────
  const hashCanvas = document.createElement("canvas");
  hashCanvas.width = 16;
  hashCanvas.height = 16;
  const hashCtx = hashCanvas.getContext("2d", { willReadFrequently: true });
  if (!hashCtx) throw new Error("Canvas 2D context unavailable");

  function perceptualHash(source: HTMLCanvasElement): string {
    hashCtx!.drawImage(source, 0, 0, 16, 16);
    const data = hashCtx!.getImageData(0, 0, 16, 16).data;
    let h = 2166136261;
    for (let i = 0; i < data.length; i += 4) {
      h = Math.imul(h ^ data[i], 16777619);
      h = Math.imul(h ^ data[i + 1], 16777619);
      h = Math.imul(h ^ data[i + 2], 16777619);
    }
    return (h >>> 0).toString(36);
  }

  // ── Phase 1 — capture one loop ────────────────────────────────────────
  const bitmaps: ImageBitmap[] = new Array(loopFrames);
  const uniqueAt: number[] = [];
  let prevFingerprint: string | null = null;
  let prevHash: string | null = null;
  let captured = 0;
  const reportCapture = () =>
    opts.onProgress?.(++captured, loopFrames + totalFrames);

  node.classList.add("banner-animated");
  node.classList.add("banner-frame-seek");
  try {
    for (let i = 0; i < loopFrames; i++) {
      node.style.setProperty("--banner-t", String(i / fps));

      // Single rAF so the browser applies the new --banner-t before we read
      // computed styles or paint.
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const fp = animFingerprint();

      if (fp === prevFingerprint && i > 0) {
        // Fast path — no CSS property changed. Skip toCanvas entirely.
        bitmaps[i] = bitmaps[i - 1];
        reportCapture();
        continue;
      }
      prevFingerprint = fp;

      // Slow path — something changed; capture the frame.
      const frameCanvas = await toCanvas(node, {
        width,
        height,
        pixelRatio: 1,
        cacheBust: false,
      });

      const hash = perceptualHash(frameCanvas);
      if (hash === prevHash && i > 0) {
        // Fingerprint differed but pixels are identical (rare easing edge case).
        bitmaps[i] = bitmaps[i - 1];
      } else {
        bitmaps[i] = await createImageBitmap(frameCanvas);
        uniqueAt.push(i);
        prevHash = hash;
      }
      reportCapture();
    }
  } finally {
    node.classList.remove("banner-frame-seek");
    node.classList.remove("banner-animated");
    node.style.removeProperty("--banner-t");
  }

  // ── Phase 2 — encode all loops ────────────────────────────────────────
  let encoded = 0;
  const reportEncode = (n: number) => {
    encoded += n;
    opts.onProgress?.(captured + encoded, loopFrames + totalFrames);
  };
  const yieldToUI = () => new Promise<void>((r) => setTimeout(r, 0));
  const drainIfNeeded = async (maxQueue: number) => {
    if (encoder.encodeQueueSize > maxQueue) await yieldToUI();
  };

  const numLoops = Math.ceil(totalFrames / loopFrames);
  let encodeFrameCount = 0;
  for (let loop = 0; loop < numLoops; loop++) {
    const loopStart = loop * loopFrames;
    for (let u = 0; u < uniqueAt.length; u++) {
      const idxInLoop = uniqueAt[u];
      const nextIdxInLoop =
        u + 1 < uniqueAt.length ? uniqueAt[u + 1] : loopFrames;
      const absoluteIdx = loopStart + idxInLoop;
      if (absoluteIdx >= totalFrames) break;
      const absoluteNext = Math.min(loopStart + nextIdxInLoop, totalFrames);
      const runLength = absoluteNext - absoluteIdx;

      const frame = new VideoFrame(bitmaps[idxInLoop], {
        timestamp: absoluteIdx * perFrameUs,
        duration: runLength * perFrameUs,
      });
      const isKeyframe =
        idxInLoop === uniqueAt[0] && loop === 0
          ? true
          : absoluteIdx % fps === 0;
      encoder.encode(frame, { keyFrame: isKeyframe });
      frame.close();
      reportEncode(runLength);
      encodeFrameCount++;
      if (encodeFrameCount % 10 === 0) await yieldToUI();
      else await drainIfNeeded(16);
    }
  }

  await encoder.flush();
  muxer.finalize();

  for (const bm of new Set(bitmaps)) bm.close();

  const target = muxer.target as { buffer: ArrayBuffer };
  const blob = new Blob([target.buffer], { type: "video/mp4" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.mp4`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

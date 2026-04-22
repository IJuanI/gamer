"use client";

import { toCanvas } from "html-to-image";

/**
 * Export a sequence of banner clips as an MP4 with optional audio track.
 *
 * Each clip is a pre-rendered DOM node (the editor keeps a hidden "rack").
 * The rack is iterated in sequence order; for each frame we set `--banner-t`
 * on the active clip's node (driving CSS animation seek) and capture via
 * `toCanvas`. Frames are deduped across loop repetitions: each (clip, intraFrame)
 * pair is captured at most once, then reused for every repeat in the sequence.
 *
 * Audio (optional): decoded with Web Audio, sliced [offset, offset+totalSec),
 * re-encoded as AAC via WebCodecs, muxed into the same mp4.
 *
 * Chrome / Edge only (WebCodecs AAC). Safari patchy, Firefox absent.
 */

export interface SequenceClip {
  id: string;
  node: HTMLElement;
  durationSec: number;
  animated: boolean;
}

export interface SequenceAudio {
  url: string;       // data URL or blob URL
  offsetSec: number; // where in the file to start
  volume: number;    // 0-1
}

export interface SequenceExportOpts {
  clips: SequenceClip[];
  totalSec: number;
  loop: boolean;
  width: number;
  height: number;
  fps?: number;
  bitrate?: number;
  audio?: SequenceAudio | null;
  filename: string;
  onProgress?: (phase: "capture" | "encode" | "audio" | "mux", done: number, total: number) => void;
}

export async function exportSequenceMp4(opts: SequenceExportOpts): Promise<void> {
  const {
    clips,
    totalSec,
    loop,
    width,
    height,
    filename,
    audio,
    onProgress,
  } = opts;
  const fps = opts.fps ?? 30;
  const bitrate = opts.bitrate ?? 8_000_000;
  const perFrameUs = Math.round(1_000_000 / fps);

  if (typeof VideoEncoder === "undefined") {
    throw new Error("WebCodecs no disponible. Usá Chrome o Edge.");
  }
  if (clips.length === 0) throw new Error("La secuencia no tiene clips.");

  const naturalSec = clips.reduce((s, c) => s + c.durationSec, 0);
  const actualTotalSec = loop ? totalSec : naturalSec;
  const totalFrames = Math.round(actualTotalSec * fps);

  // Pre-compute clip boundaries in frames (natural, pre-loop).
  const clipFrameSpans: { start: number; end: number; length: number }[] = [];
  let acc = 0;
  for (const c of clips) {
    const len = Math.round(c.durationSec * fps);
    clipFrameSpans.push({ start: acc, end: acc + len, length: len });
    acc += len;
  }
  const naturalFrames = acc;

  // ── muxer ────────────────────────────────────────────────────────────
  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
  let audioInfo: { sampleRate: number; numberOfChannels: number } | null = null;
  let audioBuffer: AudioBuffer | null = null;

  if (audio && audio.url) {
    const res = await fetch(audio.url);
    const arr = await res.arrayBuffer();
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioBuffer = await ctx.decodeAudioData(arr);
    audioInfo = {
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: Math.min(audioBuffer.numberOfChannels, 2),
    };
    await ctx.close();
  }

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width, height, frameRate: fps },
    audio: audioInfo
      ? { codec: "aac", sampleRate: audioInfo.sampleRate, numberOfChannels: audioInfo.numberOfChannels }
      : undefined,
    fastStart: "in-memory",
  });

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error("VideoEncoder", e),
  });
  videoEncoder.configure({ codec: "avc1.640028", width, height, bitrate, framerate: fps });

  // ── Phase 1: capture unique frames per clip ──────────────────────────
  // bitmaps[clipIdx][intraFrame] — captured once, reused across loop repeats.
  const bitmaps: ImageBitmap[][] = clips.map(() => []);
  const totalUnique = clipFrameSpans.reduce((s, f) => s + f.length, 0);
  let captured = 0;

  for (let ci = 0; ci < clips.length; ci++) {
    const clip = clips[ci];
    const node = clip.node;
    const span = clipFrameSpans[ci];
    if (clip.animated) {
      node.classList.add("banner-frame-seek");
    }
    try {
      let prevBitmap: ImageBitmap | null = null;
      let prevFp: string | null = null;
      for (let f = 0; f < span.length; f++) {
        if (clip.animated) {
          node.style.setProperty("--banner-t", String(f / fps));
          await new Promise<void>((r) => requestAnimationFrame(() => r()));
        }
        const fp = clip.animated ? quickFingerprint(node) : "static";
        if (fp === prevFp && prevBitmap) {
          bitmaps[ci][f] = prevBitmap;
        } else {
          const canvas = await toCanvas(node, { width, height, pixelRatio: 1, cacheBust: false });
          prevBitmap = await createImageBitmap(canvas);
          bitmaps[ci][f] = prevBitmap;
          prevFp = fp;
        }
        captured++;
        onProgress?.("capture", captured, totalUnique);
      }
    } finally {
      node.classList.remove("banner-frame-seek");
      node.style.removeProperty("--banner-t");
    }
  }

  // ── Phase 2: encode video frames in sequence order ───────────────────
  const yieldToUI = () => new Promise<void>((r) => setTimeout(r, 0));
  for (let absFrame = 0; absFrame < totalFrames; absFrame++) {
    const seqFrame = loop && naturalFrames > 0 ? absFrame % naturalFrames : absFrame;
    // find clip
    let ci = 0;
    let intra = seqFrame;
    for (let i = 0; i < clipFrameSpans.length; i++) {
      if (seqFrame < clipFrameSpans[i].end) {
        ci = i;
        intra = seqFrame - clipFrameSpans[i].start;
        break;
      }
    }
    intra = Math.min(intra, bitmaps[ci].length - 1);
    const bm = bitmaps[ci][intra];
    if (!bm) continue;
    const frame = new VideoFrame(bm, {
      timestamp: absFrame * perFrameUs,
      duration: perFrameUs,
    });
    videoEncoder.encode(frame, { keyFrame: absFrame % fps === 0 });
    frame.close();
    onProgress?.("encode", absFrame + 1, totalFrames);
    if (absFrame % 16 === 0) await yieldToUI();
    else if (videoEncoder.encodeQueueSize > 24) await yieldToUI();
  }
  await videoEncoder.flush();

  // ── Phase 3: encode audio (if any) ───────────────────────────────────
  if (audioBuffer && audioInfo && audio) {
    onProgress?.("audio", 0, 1);
    await encodeAudioSlice({
      muxer,
      buffer: audioBuffer,
      info: audioInfo,
      offsetSec: audio.offsetSec,
      durationSec: actualTotalSec,
      volume: audio.volume,
      onProgress: (d, t) => onProgress?.("audio", d, t),
    });
  }

  muxer.finalize();
  onProgress?.("mux", 1, 1);

  // cleanup
  const seen = new Set<ImageBitmap>();
  for (const arr of bitmaps) for (const b of arr) {
    if (!seen.has(b)) { seen.add(b); b.close(); }
  }

  const buf = (muxer.target as { buffer: ArrayBuffer }).buffer;
  const blob = new Blob([buf], { type: "video/mp4" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.mp4`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── helpers ────────────────────────────────────────────────────────────

function quickFingerprint(node: HTMLElement): string {
  const sels = ["svg.absolute", ".bg-grid-neon-fade", ".bg-grid"];
  const parts: string[] = [];
  for (const sel of sels) {
    const els = node.querySelectorAll(sel);
    for (let i = 0; i < els.length && i < 4; i++) {
      const s = getComputedStyle(els[i]);
      parts.push(`${s.transform}|${s.filter}|${s.opacity}`);
    }
  }
  return parts.join("\n");
}

async function encodeAudioSlice(args: {
  muxer: { addAudioChunk: (chunk: EncodedAudioChunk, meta?: EncodedAudioChunkMetadata) => void };
  buffer: AudioBuffer;
  info: { sampleRate: number; numberOfChannels: number };
  offsetSec: number;
  durationSec: number;
  volume: number;
  onProgress?: (done: number, total: number) => void;
}): Promise<void> {
  const { muxer, buffer, info, offsetSec, durationSec, volume, onProgress } = args;
  const { sampleRate, numberOfChannels } = info;
  const totalFrames = Math.round(durationSec * sampleRate);
  const chunkFrames = 1024;

  const encoder = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: (e) => console.error("AudioEncoder", e),
  });
  encoder.configure({
    codec: "mp4a.40.2",
    sampleRate,
    numberOfChannels,
    bitrate: 128_000,
  });

  // Extract channel data up-front; slice [offset, offset+duration).
  const offsetFrames = Math.round(offsetSec * sampleRate);
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const slice = new Float32Array(totalFrames);
    const available = Math.min(totalFrames, src.length - offsetFrames);
    if (available > 0) {
      slice.set(src.subarray(offsetFrames, offsetFrames + available));
      if (volume !== 1) {
        for (let i = 0; i < available; i++) slice[i] *= volume;
      }
    }
    channelData.push(slice);
  }

  let processed = 0;
  let tsMicro = 0;
  while (processed < totalFrames) {
    const n = Math.min(chunkFrames, totalFrames - processed);
    // Assemble planar f32 (channels concatenated).
    const plane = new Float32Array(n * numberOfChannels);
    for (let ch = 0; ch < numberOfChannels; ch++) {
      plane.set(channelData[ch].subarray(processed, processed + n), ch * n);
    }
    const data = new AudioData({
      timestamp: tsMicro,
      format: "f32-planar",
      sampleRate,
      numberOfChannels,
      numberOfFrames: n,
      data: plane,
    });
    encoder.encode(data);
    data.close();
    tsMicro += Math.round((n / sampleRate) * 1_000_000);
    processed += n;
    onProgress?.(processed, totalFrames);
    if (encoder.encodeQueueSize > 16) await new Promise((r) => setTimeout(r, 0));
  }
  await encoder.flush();
  encoder.close();
}

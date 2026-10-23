"use client";

import { toCanvas } from "html-to-image";
import { ArrayBufferTarget, Muxer } from "webm-muxer";

export interface VideoExportOptions {
  /** Length of the whole timeline, in ms. */
  totalMs: number;
  fps: number;
  width: number;
  height: number;
  /** Renders the frame at `tMs` and returns the node to capture. */
  renderAt: (tMs: number) => Promise<HTMLElement>;
  /** The music file and its offset (see StoryConfig.musicOffsetMs). Omit for a silent video. */
  audio?: { file: File; offsetMs: number };
  onProgress?: (done: number, total: number) => void;
}

const AUDIO_RATE = 48000;
const AUDIO_CHANNELS = 2;
const OPUS_FRAMES = 960;

export function videoExportSupported(): boolean {
  return typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined" && typeof AudioEncoder !== "undefined";
}

/**
 * Mixes the track onto the timeline. Timeline time t plays track time t + offset, so a positive
 * offset skips into the song and a negative one holds silence before it starts.
 */
async function renderAudio(file: File, offsetMs: number, totalMs: number): Promise<AudioBuffer> {
  const decodeCtx = new AudioContext();
  let source: AudioBuffer;
  try {
    source = await decodeCtx.decodeAudioData(await file.arrayBuffer());
  } finally {
    await decodeCtx.close();
  }
  const length = Math.ceil((totalMs / 1000) * AUDIO_RATE);
  const offline = new OfflineAudioContext(AUDIO_CHANNELS, length, AUDIO_RATE);
  const node = offline.createBufferSource();
  node.buffer = source;
  node.connect(offline.destination);
  node.start(Math.max(0, -offsetMs) / 1000, Math.max(0, offsetMs) / 1000);
  return offline.startRendering();
}

async function encodeAudio(muxer: Muxer<ArrayBufferTarget>, buffer: AudioBuffer): Promise<void> {
  const encoder = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: (e) => {
      throw e;
    },
  });
  encoder.configure({ codec: "opus", sampleRate: AUDIO_RATE, numberOfChannels: AUDIO_CHANNELS, bitrate: 160000 });

  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  for (let i = 0; i < buffer.length; i += OPUS_FRAMES) {
    const frames = Math.min(OPUS_FRAMES, buffer.length - i);
    const planar = new Float32Array(frames * AUDIO_CHANNELS);
    planar.set(left.subarray(i, i + frames), 0);
    planar.set(right.subarray(i, i + frames), frames);
    const data = new AudioData({
      format: "f32-planar",
      sampleRate: AUDIO_RATE,
      numberOfFrames: frames,
      numberOfChannels: AUDIO_CHANNELS,
      timestamp: Math.round((i / AUDIO_RATE) * 1e6),
      data: planar,
    });
    encoder.encode(data);
    data.close();
  }
  await encoder.flush();
  encoder.close();
}

/**
 * Renders the story frame by frame and encodes it as WebM (VP9 video, Opus audio).
 * Frames come from the same DOM as the preview, so effects and reveals match what is seen.
 */
export async function exportStoryVideo(opts: VideoExportOptions): Promise<Blob> {
  if (!videoExportSupported()) {
    throw new Error("Este navegador no puede codificar video (WebCodecs). Probá con Chrome o Edge.");
  }
  const { width, height, fps, totalMs } = opts;
  const frameCount = Math.max(1, Math.ceil((totalMs / 1000) * fps));
  const hasAudio = !!opts.audio;

  const config = { codec: "vp09.00.10.08", width, height, bitrate: 8_000_000, framerate: fps };
  const support = await VideoEncoder.isConfigSupported(config);
  if (!support.supported) throw new Error("Este navegador no soporta codificar VP9 en video.");

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: "V_VP9", width, height, frameRate: fps },
    audio: hasAudio ? { codec: "A_OPUS", numberOfChannels: AUDIO_CHANNELS, sampleRate: AUDIO_RATE } : undefined,
  });

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      throw e;
    },
  });
  videoEncoder.configure(config);

  if (opts.audio) {
    const buffer = await renderAudio(opts.audio.file, opts.audio.offsetMs, totalMs);
    await encodeAudio(muxer, buffer);
  }

  await document.fonts.ready;
  const frameUs = 1e6 / fps;
  for (let i = 0; i < frameCount; i++) {
    const node = await opts.renderAt((i * 1000) / fps);
    const canvas = await toCanvas(node, { width, height, pixelRatio: 1, cacheBust: false });
    const frame = new VideoFrame(canvas, { timestamp: Math.round(i * frameUs), duration: Math.round(frameUs) });
    videoEncoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
    frame.close();
    // Keep the encoder queue short so memory stays bounded.
    while (videoEncoder.encodeQueueSize > 4) await new Promise((r) => setTimeout(r, 5));
    opts.onProgress?.(i + 1, frameCount);
  }

  await videoEncoder.flush();
  videoEncoder.close();
  muxer.finalize();
  return new Blob([target.buffer], { type: "video/webm" });
}

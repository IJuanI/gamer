/**
 * Beat detection for cutting story panels to music.
 * Energy-based onset detection: 10 ms energy frames, positive rise in log energy,
 * an adaptive threshold over ~1 s, and a peak must beat its neighbours. Accuracy is
 * good for music with clear percussion. It is not sample-accurate.
 */

export interface BeatAnalysis {
  /** Estimated tempo, folded into 70–180 BPM. 0 when there were too few beats. */
  bpm: number;
  /** Beat times in seconds, ascending. */
  beats: number[];
}

const HOP_SEC = 0.01;
const MIN_GAP_SEC = 0.25;

export function findBeats(samples: Float32Array, sampleRate: number): BeatAnalysis {
  const hop = Math.max(1, Math.round(sampleRate * HOP_SEC));
  const win = hop * 2;
  const frames = Math.max(0, Math.floor((samples.length - win) / hop));
  if (frames < 3) return { bpm: 0, beats: [] };

  const energy = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    const start = f * hop;
    for (let i = 0; i < win; i++) {
      const s = samples[start + i];
      sum += s * s;
    }
    energy[f] = sum / win;
  }

  // Onset strength: how much the log energy rose since the previous frame.
  const flux = new Float32Array(frames);
  for (let f = 1; f < frames; f++) {
    flux[f] = Math.max(0, Math.log1p(energy[f] * 100) - Math.log1p(energy[f - 1] * 100));
  }

  // Adaptive threshold: local mean over ±50 frames (about 1 s) times 1.5.
  const prefix = new Float64Array(frames + 1);
  for (let f = 0; f < frames; f++) prefix[f + 1] = prefix[f] + flux[f];
  const half = 50;
  const peakSpan = Math.round(MIN_GAP_SEC / HOP_SEC / 2);

  const candidates: number[] = [];
  for (let f = 1; f < frames - 1; f++) {
    const lo = Math.max(0, f - half);
    const hi = Math.min(frames, f + half + 1);
    const localMean = (prefix[hi] - prefix[lo]) / (hi - lo);
    const threshold = localMean * 1.5 + 0.01;
    if (flux[f] <= threshold) continue;
    let isPeak = true;
    for (let k = Math.max(0, f - 5); k <= Math.min(frames - 1, f + 5); k++) {
      if (flux[k] > flux[f] || (k < f && flux[k] === flux[f])) {
        isPeak = false;
        break;
      }
    }
    if (isPeak) candidates.push(f);
  }

  // Enforce the minimum gap between beats, keeping the stronger of two close peaks.
  const beatsFrames: number[] = [];
  for (const f of candidates) {
    const last = beatsFrames[beatsFrames.length - 1];
    if (last === undefined || f - last >= peakSpan * 2) {
      beatsFrames.push(f);
    } else if (flux[f] > flux[last]) {
      beatsFrames[beatsFrames.length - 1] = f;
    }
  }

  const beats = beatsFrames.map((f) => (f * hop) / sampleRate);
  return { bpm: estimateBpm(beats), beats };
}

function estimateBpm(beats: number[]): number {
  if (beats.length < 4) return 0;
  const gaps: number[] = [];
  for (let i = 1; i < beats.length; i++) gaps.push(beats[i] - beats[i - 1]);
  gaps.sort((a, b) => a - b);
  const median = gaps[Math.floor(gaps.length / 2)];
  if (!median) return 0;
  let bpm = 60 / median;
  while (bpm < 70) bpm *= 2;
  while (bpm > 180) bpm /= 2;
  return Math.round(bpm);
}

/**
 * Cut points for story panels, one cut every `every` beats. Cut 0 is always 0 ms.
 * When detection found too few beats, falls back to the tempo, or a fixed step.
 */
export function cutsFromBeats(analysis: BeatAnalysis, every: number, count: number, fallbackMs: number): number[] {
  const cuts = [0];
  for (let i = 1; i < count; i++) {
    const beatTime = analysis.beats[i * every];
    if (beatTime !== undefined) {
      cuts.push(Math.round(beatTime * 1000));
    } else if (analysis.bpm > 0) {
      cuts.push(Math.round(i * every * (60000 / analysis.bpm)));
    } else {
      cuts.push(i * fallbackMs);
    }
  }
  return cuts;
}

/** Decodes an audio file to mono samples in the browser. */
export async function decodeAudioFile(file: File): Promise<{ samples: Float32Array; sampleRate: number }> {
  const ctx = new AudioContext();
  try {
    const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
    const mono = new Float32Array(buffer.length);
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const channel = buffer.getChannelData(c);
      for (let i = 0; i < channel.length; i++) mono[i] += channel[i] / buffer.numberOfChannels;
    }
    return { samples: mono, sampleRate: buffer.sampleRate };
  } finally {
    await ctx.close();
  }
}

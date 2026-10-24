"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Flyer } from "@/components/flyers/flyer";
import { StoryMotionContext, type StoryMotion } from "@/components/flyers/story-motion";
import type { FlyerBrand } from "@/lib/flyer-brands";
import { FLYER_FORMATS } from "@/lib/flyer-formats";
import { FLYER_DEFAULTS, type FlyerData } from "@/lib/flyer-kinds";
import { CONTENT_OPTIONS, frameAt, MIN_PANEL_MS, type EffectId, type StoryConfig, type StoryPanel, type Timeline } from "@/lib/story-model";
import { transitionStyles } from "@/lib/story-transitions";

interface StoryPlayerProps {
  config: StoryConfig;
  timeline: Timeline;
  /** Optional music. Its clock drives the timeline so cuts stay on the beat. */
  audioUrl: string | null;
  playing: boolean;
  width: number;
  onEnded: () => void;
  /** Called every frame with the timeline time while playing. Lets the editor follow the playhead. */
  onTime?: (t: number) => void;
  /** When set, the player shows this exact timeline time and runs no clock. Used for video export. */
  frozenT?: number | null;
}

const FORMAT = FLYER_FORMATS["instagram-story"];
const SHAKE_MS = 380;
const SHAKE_PX = 42;
const FLASH_MS = 220;
const PARTICLES = 24;

/** Deterministic 0..1 value. Effects depend only on the clock, so a frame can be replayed exactly. */
function rnd(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Plays the story on a timeline. Each panel is a flyer whose blocks enter on their own schedule.
 * Effects belong to each panel. A transition plays both panels' effects while it runs.
 * With music, the track sets the clock. `musicOffsetMs` moves the track against the timeline.
 */
export function StoryPlayer({ config, timeline, audioUrl, playing, width, onEnded, onTime, frozenT = null }: StoryPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [t, setT] = useState(0);
  const scale = width / FORMAT.width;
  const offset = config.musicOffsetMs;

  useEffect(() => {
    if (!playing || frozenT !== null) return;
    const audio = audioRef.current;
    const startedAt = performance.now();
    let raf = 0;
    let delay: number | undefined;
    // Timeline time t plays track time t + offset. With a negative offset the track starts later,
    // so the clock runs on performance.now until the track starts.
    let audioLive = !audio || offset >= 0;
    if (audio) {
      try {
        audio.currentTime = Math.max(0, offset) / 1000;
      } catch {
        // Not seekable yet. The track starts from 0 then.
      }
      if (offset >= 0) {
        void audio.play();
      } else {
        delay = window.setTimeout(() => {
          audioLive = true;
          void audio.play();
        }, -offset);
      }
    }
    const tick = () => {
      const ms = audio && audioLive ? audio.currentTime * 1000 - offset : performance.now() - startedAt;
      // The audio can end before the timeline does (or the reverse). Stop at whichever comes first.
      if (ms >= timeline.total || (audio && audioLive && audio.ended)) {
        setT(0);
        onTime?.(0);
        audio?.pause();
        onEnded();
        return;
      }
      setT(ms);
      onTime?.(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(delay);
      audio?.pause();
    };
  }, [playing, timeline, onEnded, onTime, offset, frozenT]);

  if (timeline.segments.length === 0) return null;

  const time = frozenT ?? t;
  const frame = frameAt(time, timeline);
  const seg = timeline.segments[frame.current];
  const prevSeg = frame.prev === null ? null : timeline.segments[frame.prev];
  const styles = transitionStyles(seg.transition, frame.e, { direction: seg.direction, strength: seg.strength });
  // Cut effects (shake, flash) and the zoom belong to the panel that just came in.
  const own = new Set<EffectId>(seg.panel.effects);
  // Overlays draw both panels' effects during a transition.
  const fx = new Set<EffectId>([...seg.panel.effects, ...(prevSeg?.panel.effects ?? [])]);
  const cut = frame.current > 0;

  const shake = own.has("sacudida") && cut && frame.local < SHAKE_MS ? (1 - frame.local / SHAKE_MS) * SHAKE_PX : 0;
  const shakeX = Math.sin(frame.local * 0.12) * shake;
  const shakeY = Math.cos(frame.local * 0.17) * shake * 0.6;
  const flash = own.has("destello") && cut && frame.local < FLASH_MS ? 1 - frame.local / FLASH_MS : 0;
  const segLen = Math.max(1, seg.end - seg.start);
  const zoom = own.has("zoom") ? 1 + 0.08 * Math.min(1, (time - seg.start) / segLen) : 1;

  const transitioning = prevSeg !== null;
  const now = new Date();
  return (
    <div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}
      <StageShell width={width} scale={scale} shake={[shakeX, shakeY]} stageStyle={styles.stage}>
        {transitioning && prevSeg && (
          <PanelSlot style={styles.prev} zoom={1}>
            <PanelFlyer brand={config.brand} panel={prevSeg.panel} local={frame.prevLocal} now={now} />
          </PanelSlot>
        )}
        <PanelSlot style={transitioning ? styles.next : {}} zoom={zoom}>
          <PanelFlyer brand={config.brand} panel={seg.panel} local={frame.local} now={now} />
        </PanelSlot>
        <Overlays t={time} fx={fx} flash={flash} />
      </StageShell>
    </div>
  );
}

/**
 * One panel on a loop, for the per-panel preview beside the editor. Plays the panel's own
 * entrance, reveal and effects from the start, over and over. It has no transition.
 */
export function PanelLoop({ brand, panel, width }: { brand: FlyerBrand; panel: StoryPanel; width: number }) {
  const [local, setLocal] = useState(0);
  const dur = Math.max(MIN_PANEL_MS, panel.durationMs);

  useEffect(() => {
    const startedAt = performance.now();
    let raf = 0;
    const tick = () => {
      setLocal((performance.now() - startedAt) % dur);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dur]);

  const scale = width / FORMAT.width;
  const fx = new Set<EffectId>(panel.effects);
  const shake = fx.has("sacudida") && local < SHAKE_MS ? (1 - local / SHAKE_MS) * SHAKE_PX : 0;
  const shakeX = Math.sin(local * 0.12) * shake;
  const shakeY = Math.cos(local * 0.17) * shake * 0.6;
  const flash = fx.has("destello") && local < FLASH_MS ? 1 - local / FLASH_MS : 0;
  const zoom = fx.has("zoom") ? 1 + 0.08 * (local / dur) : 1;

  return (
    <StageShell width={width} scale={scale} shake={[shakeX, shakeY]}>
      <PanelSlot style={{}} zoom={zoom}>
        <PanelFlyer brand={brand} panel={panel} local={local} now={new Date()} />
      </PanelSlot>
      <Overlays t={local} fx={fx} flash={flash} />
    </StageShell>
  );
}

/** Scaled box that holds the 1080-wide stage. The stage itself is unscaled so it can be captured at full size. */
function StageShell({
  width,
  scale,
  shake,
  stageStyle,
  children,
}: {
  width: number;
  scale: number;
  shake: [number, number];
  stageStyle?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/8" style={{ width, height: FORMAT.height * scale }}>
      <div style={{ width: FORMAT.width, height: FORMAT.height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <div data-story-stage className="relative overflow-hidden" style={{ width: FORMAT.width, height: FORMAT.height, ...stageStyle }}>
          <div className="absolute inset-0" style={{ transform: `translate(${shake[0]}px, ${shake[1]}px)` }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelSlot({ style, zoom, children }: { style: CSSProperties; zoom: number; children: ReactNode }) {
  return (
    <div className="absolute inset-0" style={style}>
      <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: "50% 40%" }}>
        {children}
      </div>
    </div>
  );
}

/** Brand defaults, with this panel's own text and background laid over them. */
export function panelFlyerData(brand: FlyerBrand, panel: StoryPanel): FlyerData {
  return {
    ...FLYER_DEFAULTS[brand],
    ...panel.text,
    ...(panel.background ? { background: panel.background } : {}),
  };
}

function PanelFlyer({ brand, panel, local, now }: { brand: FlyerBrand; panel: StoryPanel; local: number; now: Date }) {
  const option = CONTENT_OPTIONS[panel.content];
  const motion: StoryMotion = {
    local,
    entrance: panel.entrance,
    reveal: panel.reveal,
    stepMs: panel.revealStepMs,
    effects: panel.effects,
  };
  return (
    <StoryMotionContext.Provider value={motion}>
      <Flyer
        brand={brand}
        kind={option.kind}
        variant={option.variant}
        infoVariant={option.infoVariant}
        data={panelFlyerData(brand, panel)}
        format={FORMAT}
        now={now}
        hidden={panel.hidden ?? {}}
      />
    </StoryMotionContext.Provider>
  );
}

/** Effects that sit above the panels. Each one is computed from t, so the output is deterministic. */
function Overlays({ t, fx, flash }: { t: number; fx: Set<EffectId>; flash: number }) {
  return (
    <>
      {fx.has("particulas") && <Particles t={t} />}
      {fx.has("vineta") && (
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)" }} />
      )}
      {fx.has("scanlines") && (
        <div className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.45) 0 4px, transparent 4px 8px)" }} />
      )}
      {fx.has("grano") && <Grain t={t} />}
      {flash > 0 && <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: "#fff", opacity: flash * 0.85 }} />}
    </>
  );
}

/** Floating sparks that rise over the whole stage. Their position comes only from t. */
function Particles({ t }: { t: number }) {
  return (
    <>
      {Array.from({ length: PARTICLES }, (_, i) => {
        const x = rnd(i, 1) * FORMAT.width;
        const speed = 60 + rnd(i, 2) * 140;
        const y = FORMAT.height - ((((t / 1000) * speed) + rnd(i, 3) * FORMAT.height) % FORMAT.height);
        const size = 6 + rnd(i, 4) * 10;
        return (
          <div
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{ left: x, top: y, width: size, height: size, backgroundColor: i % 2 ? "#3cff9e" : "#8b6cff", opacity: 0.6 }}
          />
        );
      })}
    </>
  );
}

/** Film grain. The dot pattern is offset every 60 ms so it shimmers. */
function Grain({ t }: { t: number }) {
  const step = Math.floor(t / 60);
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1.5px, transparent 1.5px)",
        backgroundSize: "5px 5px",
        backgroundPosition: `${(step * 37) % 97}px ${(step * 53) % 89}px`,
        opacity: 0.9,
      }}
    />
  );
}

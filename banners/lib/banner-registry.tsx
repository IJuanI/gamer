"use client";

import {
  OpenDuoStory,
  OpenDuoFeed,
  OpenDuoWhatsApp,
  OpenDuoCountdownStory,
  OpenDuoCountdownFeed,
  OpenDuoCountdownWhatsApp,
  OpenDuoGameSpotlight,
  OpenDuoSpotlightStory,
  OpenDuoSpotlightWhatsApp,
  OpenDuoPublicFeed,
  OpenDuoPublicWhatsApp,
  PublicStoryB,
} from "@/components/banners";
import {
  StoryBackground,
  CountdownBackground,
  FeedBackground,
} from "@/components/banners/backgrounds";
import type { EventData } from "@/lib/event-data";
import { FORMATS } from "@/lib/formats";
import type { BannerVariation } from "@/lib/variation";

export type Template = "anuncio" | "countdown" | "spotlight" | "publico";
export type Format = "story" | "feed" | "whatsapp";

export const FORMAT_LABELS: Record<Format, string> = {
  story: "IG Story",
  feed: "IG Feed",
  whatsapp: "WhatsApp",
};

export const TEMPLATE_LABELS: Record<Template, string> = {
  anuncio: "Anuncio",
  countdown: "Countdown",
  spotlight: "Spotlight",
  publico: "Público",
};

export const FORMAT_DIMS = {
  story:    FORMATS["instagram-story"],
  feed:     FORMATS["instagram-feed-post"],
  whatsapp: FORMATS["whatsapp-status"],
} satisfies Record<Format, object>;

export interface BannerEntry {
  format: { width: number; height: number; aspectRatio: string };
  render: () => React.ReactNode;
  renderBg: () => React.ReactNode;
}

export function resolveBanner(
  event: EventData,
  template: Template,
  gameKey: string,
  format: Format,
  days: number,
  variation: BannerVariation,
  sponsor?: { logos: string[]; bgImage?: string },
): BannerEntry {
  const game = event.gameDetails?.find((g) => g.shortName.toLowerCase() === gameKey);
  const bgAccent = (game?.accent ?? "purple") as "purple" | "green" | "orange";
  const sl = sponsor?.logos;
  const bi = sponsor?.bgImage;

  switch (`${template}-${format}` as `${Template}-${Format}`) {
    case "anuncio-story":     return { format: FORMAT_DIMS.story,    render: () => <OpenDuoStory event={event} variation={variation} sponsorLogos={sl} bgImage={bi} />,                            renderBg: () => <StoryBackground variant="story" /> };
    case "anuncio-feed":      return { format: FORMAT_DIMS.feed,     render: () => <OpenDuoFeed event={event} variation={variation} sponsorLogos={sl} bgImage={bi} />,                             renderBg: () => <FeedBackground accent="mixed" /> };
    case "anuncio-whatsapp":  return { format: FORMAT_DIMS.whatsapp, render: () => <OpenDuoWhatsApp event={event} variation={variation} />,                         renderBg: () => <StoryBackground variant="whatsapp" /> };
    case "countdown-story":   return { format: FORMAT_DIMS.story,    render: () => <OpenDuoCountdownStory event={event} daysLeft={days} variation={variation} sponsorLogos={sl} bgImage={bi} />,   renderBg: () => <CountdownBackground /> };
    case "countdown-feed":    return { format: FORMAT_DIMS.feed,     render: () => <OpenDuoCountdownFeed event={event} daysLeft={days} variation={variation} sponsorLogos={sl} bgImage={bi} />,    renderBg: () => <FeedBackground accent="mixed" /> };
    case "countdown-whatsapp":return { format: FORMAT_DIMS.whatsapp, render: () => <OpenDuoCountdownWhatsApp event={event} daysLeft={days} variation={variation} />, renderBg: () => <StoryBackground variant="whatsapp" /> };
    case "spotlight-story":   return { format: FORMAT_DIMS.story,    render: () => game ? <OpenDuoSpotlightStory event={event} game={game} variation={variation} sponsorLogos={sl} bgImage={bi} /> : null,    renderBg: () => <FeedBackground accent={bgAccent} /> };
    case "spotlight-feed":    return { format: FORMAT_DIMS.feed,     render: () => game ? <OpenDuoGameSpotlight event={event} game={game} variation={variation} sponsorLogos={sl} bgImage={bi} /> : null,     renderBg: () => <FeedBackground accent={bgAccent} /> };
    case "spotlight-whatsapp":return { format: FORMAT_DIMS.whatsapp, render: () => game ? <OpenDuoSpotlightWhatsApp event={event} game={game} variation={variation} /> : null, renderBg: () => <FeedBackground accent={bgAccent} /> };
    case "publico-story":     return { format: FORMAT_DIMS.story,    render: () => <PublicStoryB event={event} variation={variation} sponsorLogos={sl} bgImage={bi} />,         renderBg: () => <StoryBackground variant="story" /> };
    case "publico-feed":      return { format: FORMAT_DIMS.feed,     render: () => <OpenDuoPublicFeed event={event} variation={variation} sponsorLogos={sl} bgImage={bi} />,     renderBg: () => <FeedBackground accent="mixed" /> };
    case "publico-whatsapp":  return { format: FORMAT_DIMS.whatsapp, render: () => <OpenDuoPublicWhatsApp event={event} variation={variation} />, renderBg: () => <StoryBackground variant="whatsapp" /> };
    default:                  return { format: FORMAT_DIMS.story,    render: () => null, renderBg: () => null };
  }
}

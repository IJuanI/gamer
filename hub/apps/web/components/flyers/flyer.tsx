"use client";

import { BrandFlyer } from "@/components/flyers/brand-flyer";
import { InfographicFlyer } from "@/components/flyers/infographic-flyer";
import { JamFlyer } from "@/components/flyers/jam-flyer";
import { FLYER_BRANDS, type FlyerBrand } from "@/lib/flyer-brands";
import type { FlyerFormat } from "@/lib/flyer-formats";
import { variantEyebrow, type EventVariant, type FlyerData, type FlyerHidden, type FlyerKind, type InfographicVariant } from "@/lib/flyer-kinds";
import { JAM_FLYER_DATA } from "@/lib/jam-flyer-data";

interface FlyerProps {
  brand: FlyerBrand;
  kind: FlyerKind;
  variant: EventVariant;
  infoVariant: InfographicVariant;
  data: FlyerData;
  format: FlyerFormat;
  now: Date;
  hidden: FlyerHidden;
}

/** Routes to the right artwork. The Jam principal event keeps its original dedicated layout. */
export function Flyer({ brand, kind, variant, infoVariant, data, format, now, hidden }: FlyerProps) {
  const eyebrow = kind === "event" ? variantEyebrow(data, variant) : data.eyebrow;
  if (kind === "infographic") {
    return <InfographicFlyer brand={FLYER_BRANDS[brand]} variant={infoVariant} data={data} format={format} hidden={hidden} />;
  }
  // The Jam principal artwork is approved as-is. Repost variants use the shared layouts so they differ visibly.
  if (brand === "jam" && kind === "event" && variant === "principal") {
    return (
      <JamFlyer
        format={format}
        hidden={hidden}
        background={data.background}
        eventLogo={data.eventLogo}
        sponsors={data.sponsors}
        event={{
          ...JAM_FLYER_DATA,
          eyebrow,
          dateRange: data.dateText,
          venue: data.venue,
          city: data.city,
          heroText: data.subtitle,
        }}
      />
    );
  }
  return (
    <BrandFlyer
      brand={FLYER_BRANDS[brand]}
      kind={kind}
      variant={variant}
      eyebrow={eyebrow}
      data={data}
      format={format}
      now={now}
      hidden={hidden}
    />
  );
}

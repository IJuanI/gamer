"use client";

import { BrandFlyer } from "@/components/flyers/brand-flyer";
import { JamFlyer } from "@/components/flyers/jam-flyer";
import { FLYER_BRANDS, type FlyerBrand } from "@/lib/flyer-brands";
import type { FlyerFormat } from "@/lib/flyer-formats";
import { variantEyebrow, type EventVariant, type FlyerData, type FlyerKind } from "@/lib/flyer-kinds";
import { JAM_FLYER_DATA } from "@/lib/jam-flyer-data";

interface FlyerProps {
  brand: FlyerBrand;
  kind: FlyerKind;
  variant: EventVariant;
  data: FlyerData;
  format: FlyerFormat;
  now: Date;
}

/** Routes to the right artwork. The Jam event keeps its original dedicated layout. */
export function Flyer({ brand, kind, variant, data, format, now }: FlyerProps) {
  const eyebrow = kind === "event" ? variantEyebrow(data, variant) : data.eyebrow;
  if (brand === "jam" && kind === "event") {
    return (
      <JamFlyer
        format={format}
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
  return <BrandFlyer brand={FLYER_BRANDS[brand]} kind={kind} eyebrow={eyebrow} data={data} format={format} now={now} />;
}

"use client";

export function SponsorStrip({ logos, bottom = 44 }: { logos: string[]; bottom?: number }) {
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{ bottom, left: 80, right: 80, height: 130, gap: 40 }}
    >
      {logos.map((logo, i) => (
        <img
          key={i}
          src={logo}
          style={{ maxHeight: 110, maxWidth: 240, objectFit: "contain", opacity: 0.9 }}
        />
      ))}
    </div>
  );
}

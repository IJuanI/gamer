"use client";

export function SponsorStrip({ logos, bottom = 44 }: { logos: string[]; bottom?: number }) {
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{ bottom, left: 80, right: 80, height: 90, gap: 32 }}
    >
      {logos.length === 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px dashed rgba(255,255,255,0.14)",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="font-azonix"
            style={{ fontSize: 20, color: "rgba(255,255,255,0.22)", letterSpacing: "0.15em" }}
          >
            SPONSORS
          </span>
        </div>
      ) : (
        logos.map((logo, i) => (
          <img
            key={i}
            src={logo}
            style={{ maxHeight: 60, maxWidth: 200, objectFit: "contain", opacity: 0.85 }}
          />
        ))
      )}
    </div>
  );
}

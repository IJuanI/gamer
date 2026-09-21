import Link from "next/link";

type BrandType = "gamer" | "gamedevs" | "jam";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  brand?: BrandType;
}

export function Logo({ size = "md", brand = "gamer" }: LogoProps) {
  const cls = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  if (brand === "gamedevs") {
    return (
      <Link href="/devs" className={`font-azonix ${cls} tracking-wide select-none`}>
        <span style={{ color: "#72b341" }}>Game</span>
        <span style={{ color: "#808080" }}>Devs</span>
      </Link>
    );
  }

  if (brand === "jam") {
    return (
      <Link href="/jam" className={`${cls} font-oxanium font-extrabold tracking-tight select-none whitespace-nowrap`}>
        <span style={{ color: "#3cff9e", textShadow: "0 0 8px rgba(60, 255, 158, 0.3), 0 0 16px rgba(60, 255, 158, 0.15)" }}>Paraná</span>{" "}
        <span style={{ color: "#8b6cff", textShadow: "0 0 8px rgba(139, 108, 255, 0.3), 0 0 16px rgba(139, 108, 255, 0.15)" }}>Game</span>{" "}
        <span style={{ color: "#ffffff" }}>Jam</span>
      </Link>
    );
  }

  return (
    <Link href="/" className={`font-azonix ${cls} tracking-wide select-none`}>
      <span className="wordmark-gam glow-purple">GAM</span>
      <span className="wordmark-er glow-green">ER</span>
    </Link>
  );
}

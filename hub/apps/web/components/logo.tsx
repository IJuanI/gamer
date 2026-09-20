import Link from "next/link";

type BrandType = "gamer" | "gamedevs";

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

  return (
    <Link href="/" className={`font-azonix ${cls} tracking-wide select-none`}>
      <span className="wordmark-gam glow-purple">GAM</span>
      <span className="wordmark-er glow-green">ER</span>
    </Link>
  );
}

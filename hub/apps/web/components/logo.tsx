import Link from "next/link";

/** GamER wordmark — GAM purple / ER green, AZONIX. */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <Link href="/" className={`font-azonix ${cls} tracking-wide select-none`}>
      <span className="wordmark-gam glow-purple">GAM</span>
      <span className="wordmark-er glow-green">ER</span>
    </Link>
  );
}

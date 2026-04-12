/**
 * Decorative gaming iconography — inline SVGs for banner backgrounds.
 * All icons are outline-only, meant to be used at low opacity as decoration.
 */

interface IconProps {
  size?: number;
  color?: string;
  opacity?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function GamepadIcon({
  size = 80,
  color = "rgba(179,57,196,0.18)",
  style,
  className = "absolute",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M18 18h28a10 10 0 0 1 10 10v4a14 14 0 0 1-14 14H22a14 14 0 0 1-14-14v-4a10 10 0 0 1 10-10z"
        stroke={color}
        strokeWidth="2"
      />
      {/* D-pad */}
      <rect x="18" y="28" width="10" height="3" rx="1" fill={color} />
      <rect x="21.5" y="24.5" width="3" height="10" rx="1" fill={color} />
      {/* Buttons */}
      <circle cx="42" cy="27" r="2.5" stroke={color} strokeWidth="1.5" />
      <circle cx="48" cy="31" r="2.5" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function GemIcon({
  size = 60,
  color = "rgba(132,197,82,0.18)",
  style,
  className = "absolute",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M32 8 L52 24 L32 56 L12 24 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 24 L32 18 L52 24"
        stroke={color}
        strokeWidth="1.5"
      />
      <path d="M32 18 V56" stroke={color} strokeWidth="1" />
    </svg>
  );
}

export function CrosshairIcon({
  size = 70,
  color = "rgba(132,197,82,0.15)",
  style,
  className = "absolute",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
    >
      <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="1.5" />
      <circle cx="32" cy="32" r="10" stroke={color} strokeWidth="1" />
      <line x1="32" y1="4" x2="32" y2="18" stroke={color} strokeWidth="1.5" />
      <line x1="32" y1="46" x2="32" y2="60" stroke={color} strokeWidth="1.5" />
      <line x1="4" y1="32" x2="18" y2="32" stroke={color} strokeWidth="1.5" />
      <line x1="46" y1="32" x2="60" y2="32" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function AlienIcon({
  size = 70,
  color = "rgba(179,57,196,0.18)",
  style,
  className = "absolute",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M32 6C18 6 10 20 10 32c0 10 8 22 22 26 14-4 22-16 22-26 0-12-8-26-22-26z"
        stroke={color}
        strokeWidth="2"
      />
      {/* Eyes */}
      <ellipse cx="22" cy="30" rx="6" ry="4" stroke={color} strokeWidth="1.5" />
      <ellipse cx="42" cy="30" rx="6" ry="4" stroke={color} strokeWidth="1.5" />
      {/* Mouth */}
      <path d="M26 42 Q32 46 38 42" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function ShieldIcon({
  size = 70,
  color = "rgba(179,57,196,0.15)",
  style,
  className = "absolute",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M32 6L8 18v16c0 14 10 22 24 26 14-4 24-12 24-26V18L32 6z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M32 16L16 24v10c0 9 6 15 16 18 10-3 16-9 16-18V24L32 16z"
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  );
}

export function SwordIcon({
  size = 80,
  color = "rgba(132,197,82,0.15)",
  style,
  className = "absolute",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
    >
      {/* Blade */}
      <path d="M32 4 L36 36 L32 40 L28 36 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Guard */}
      <rect x="20" y="38" width="24" height="4" rx="2" stroke={color} strokeWidth="1.5" />
      {/* Grip */}
      <rect x="29" y="42" width="6" height="12" rx="1" stroke={color} strokeWidth="1.5" />
      {/* Pommel */}
      <circle cx="32" cy="57" r="3" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

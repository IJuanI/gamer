import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @gamer/shared is consumed as TS source from the workspace.
  transpilePackages: ["@gamer/shared"],
  // Allow dev server access from devices on the LAN (e.g. testing on a phone),
  // otherwise Next.js blocks cross-origin dev requests and hydration silently fails.
  allowedDevOrigins: ["192.168.68.106"],
};

export default nextConfig;

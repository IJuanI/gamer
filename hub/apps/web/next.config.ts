import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @gamer/shared is consumed as TS source from the workspace.
  transpilePackages: ["@gamer/shared"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // We live inside a larger repo; pin tracing root to this app to silence the
  // "multiple lockfiles" workspace-root inference warning.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

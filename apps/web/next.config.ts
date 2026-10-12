import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@deepmatch/shared"],
  eslint: { ignoreDuringBuilds: true },
  // Sentry webpack plugin optional — enable when NEXT_PUBLIC_SENTRY_DSN + auth token set in CI
};

export default nextConfig;

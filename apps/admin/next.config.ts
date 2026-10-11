import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@deepmatch/shared"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@deepmatch/shared",
    "@deepmatch/i18n",
    "@deepmatch/legal-content",
  ],
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      {
        source: "/terms",
        destination: "/legal/terms",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/legal/privacy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

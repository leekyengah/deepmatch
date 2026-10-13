import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@deepmatch/shared",
    "@deepmatch/i18n",
    "@deepmatch/legal-content",
  ],
  serverExternalPackages: [
    "sharp",
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "ffmpeg-static",
    "fluent-ffmpeg",
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
      // Personal Member Center — legacy aliases → canonical
      { source: "/me/profile", destination: "/me/edit", permanent: true },
      { source: "/me/settings", destination: "/me/account", permanent: true },
      { source: "/me/billing", destination: "/me/orders", permanent: true },
      { source: "/me/safety", destination: "/safe", permanent: true },
      { source: "/me/membership", destination: "/me/premium", permanent: true },
      { source: "/matches", destination: "/likes", permanent: true },
      { source: "/profile", destination: "/me", permanent: true },
      { source: "/account", destination: "/me/account", permanent: true },
      // Lifestyle marketplace — legacy aliases
      { source: "/lifestyle/home", destination: "/lifestyle", permanent: true },
      { source: "/lifestyle/modules", destination: "/lifestyle", permanent: true },
      { source: "/lifestyle/shop", destination: "/lifestyle", permanent: true },
      { source: "/deepgift", destination: "/lifestyle/gift", permanent: true },
      { source: "/deepdate", destination: "/lifestyle/venue", permanent: true },
    ];
  },
};




export default nextConfig;

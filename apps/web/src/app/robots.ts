import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isStaging =
    process.env.VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_APP_ENV === "staging";

  if (isStaging) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/faq", "/privacy", "/terms", "/login", "/signup"],
      disallow: [
        "/api/",
        "/admin",
        "/me/",
        "/discover",
        "/chat",
        "/couple",
        "/lifestyle",
        "/ai",
        "/safe",
        "/bookings",
        "/likes",
        "/services",
        "/onboarding",
      ],
    },
    sitemap: "https://datingvn.com/sitemap.xml",
  };
}

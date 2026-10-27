import type { MetadataRoute } from "next";
import { LEGAL_DOCUMENTS } from "@deepmatch/legal-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://datingvn.com";
  const now = new Date();
  const paths = [
    "",
    "/faq",
    "/legal",
    ...LEGAL_DOCUMENTS.map((d) => d.path),
    "/account-deletion",
    "/login",
    "/signup",
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/legal") ? 0.7 : 0.6,
  }));
}

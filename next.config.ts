import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Make static export opt-in via env so server runtime (API routes) remain available by default.
  // Set `NEXT_PUBLIC_STATIC_EXPORT=true` in CI when you want to export for GitHub Pages.
  output:
    process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ? "export" : undefined,
  // Base path for GitHub Pages (repository name) is configurable via env.
  basePath:
    process.env.NEXT_PUBLIC_BASE_PATH ||
    (process.env.NODE_ENV === "production" ? "/easysched-mvp" : ""),
  // If exporting statically, keep trailingSlash for GitHub Pages compatibility.
  trailingSlash:
    process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ? true : false,
  images: {
    unoptimized: process.env.NEXT_PUBLIC_STATIC_EXPORT === "true",
  },
};

export default nextConfig;

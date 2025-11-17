import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages deployment only in production
  ...(process.env.NODE_ENV === "production" ? { output: "export" } : {}),
  // Base path for GitHub Pages (repository name)
  basePath: process.env.NODE_ENV === "production" ? "/easysched-mvp" : "",
  trailingSlash: true, // Required for GitHub Pages compatibility - ensures proper routing
  images: {
    unoptimized: true, // OK for dev and export
  },
};

export default nextConfig;

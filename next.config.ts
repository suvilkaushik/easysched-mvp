import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages deployment
  output: "export",
  // Base path for GitHub Pages (repository name)
  // Only enable the `basePath` when building in GitHub Actions for Pages.
  // Vercel sets NODE_ENV='production' as well, so relying on NODE_ENV alone
  // causes the app to expect the `/easysched-mvp` prefix on Vercel deploys.
  // Use `GITHUB_ACTIONS` env var (true during the Pages workflow) to enable it.
  basePath: process.env.GITHUB_ACTIONS === "true" ? "/easysched-mvp" : "",
  trailingSlash: true, // Required for GitHub Pages compatibility - ensures proper routing
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;

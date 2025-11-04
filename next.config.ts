import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages deployment
  // Remove this if deploying to Vercel or other platforms that support server-side rendering
  output: 'export',
  // Set base path if deploying to a subdirectory (e.g., /repository-name)
  // basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
  trailingSlash: true, // Required for GitHub Pages compatibility - ensures proper routing
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;

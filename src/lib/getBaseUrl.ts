export function getBaseUrl(): string {
  // Prefer explicit NEXTAUTH_URL (or NEXT_PUBLIC_SITE_URL) when provided
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if ((process.env as any).NEXT_PUBLIC_SITE_URL)
    return (process.env as any).NEXT_PUBLIC_SITE_URL;

  // Vercel exposes VERCEL_URL at runtime for preview/prod builds
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Fallback to localhost for local development
  return "http://localhost:3000";
}

export default getBaseUrl;

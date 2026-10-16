import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // The chat preview gateway (preview-chat-*.space-z.ai) adds a trailing
  // slash to all URLs. Without this setting, Next.js's default
  // (trailingSlash: false) REMOVES the trailing slash, so:
  //   gateway: /dashboard  → 307 → /dashboard/
  //   Next.js: /dashboard/ → 308 → /dashboard
  //   gateway: /dashboard  → 307 → /dashboard/   ← infinite loop (ERR_TOO_MANY_REDIRECTS)
  // Setting trailingSlash: true makes Next.js keep the trailing slash so
  // it agrees with the gateway — no more redirect loop.
  trailingSlash: true,
};

export default nextConfig;

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

  // منع أي كاش على ردود الـ API وصفحات الموقع حتى يظهر التحديث فورًا
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
      {
        // الصفحات (مش ملفات _next الثابتة ولا الصور المرفوعة)
        source: "/((?!_next/static|_next/image|uploads|images|favicon.ico).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
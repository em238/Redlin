import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/lib/providers";

const cairo = Cairo({
  variable: "--font-geist-sans",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-geist-mono",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Redline Transport | عصب الشحن في مصر",
    template: "%s | Redline Transport",
  },
  description: "شركة شحن احترافية تغطي جميع محافظات مصر — عادي، ممتاز، نفس اليوم، وشحن ثقيل مع تتبع مباشر.",
  keywords: ["شحن", "شحن مصر", "Redline", "RedLine Transport", "توصيل", "شحنات", "خدمات لوجستية", "مصر"],
  authors: [{ name: "Redline" }],
  // Next.js App Router file-based metadata: src/app/icon.png is auto-detected
  // and generates the <link rel="icon"> tag automatically. The public/ copies
  // are referenced explicitly for legacy crawlers + shortcut icon.
  // NOTE: src/app/favicon.ico was DELETED — Turbopack threw "The PNG is not
  // in RGBA format" because it tried to decode a non-RGBA ICO internally.
  // Now only src/app/icon.png (32-bit RGBA PNG) + public/favicon.ico exist.
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Redline Transport | عصب الشحن في مصر",
    description: "شركة شحن احترافية تغطي جميع محافظات مصر — عادي، ممتاز، نفس اليوم، وشحن ثقيل مع تتبع مباشر.",
    siteName: "Redline Transport",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // NOTE: `<html>` no longer has a hardcoded `className="dark"` or inline
  // `style={{ backgroundColor: "#0b0f17" }}`. Those forced dark mode on
  // the initial SSR render (before client hydration read localStorage),
  // which caused the dashboard to flash to dark on every refresh.
  // next-themes now injects an inline script that reads
  // localStorage("redline_dashboard_theme") BEFORE hydration and applies
  // the `dark` class only if the user explicitly chose dark — so the
  // default is always light, with no flash. `suppressHydrationWarning`
  // is kept because next-themes intentionally modifies the <html> class
  // outside of React's render cycle.
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${tajawal.variable} antialiased bg-background text-foreground font-sans`}>
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}

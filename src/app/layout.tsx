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
  title: "Redline | شركة الشحن الأولى في مصر",
  description: "Redline - شركة شحن احترافية تغطي جميع محافظات مصر بسرعة وأمان. شحن عادي، ممتاز، نفس اليوم، وشحن ثقيل مع تتبع مباشر لشحناتك.",
  keywords: ["شحن", "شحن مصر", "Redline", "توصيل", "شحنات", "خدمات لوجستية", "مصر"],
  authors: [{ name: "Redline" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "Redline | شركة الشحن الأولى في مصر",
    description: "شحن احترافي لجميع محافظات مصر بسرعة وأمان",
    siteName: "Redline",
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

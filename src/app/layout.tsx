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
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Redline | شركة الشحن الأولى في مصر",
    description: "شحن احترافي لجميع محافظات مصر بسرعة وأمان",
    siteName: "Redline",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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

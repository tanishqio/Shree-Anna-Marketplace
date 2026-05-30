import type { Metadata, Viewport } from "next";
import '@/lib/polyfill-storage'; // Polyfill for SSR
import "./globals.css";

import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { LanguageProvider } from "@/lib/hooks/useLanguage";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Shree Anna - Millets Marketplace | श्री अन्न",
  description: "India's trusted marketplace connecting smallholder farmers to buyers. Sell millets at fair prices with voice-enabled listings, offline support, and complete traceability.",
  keywords: "millets, millet marketplace, farmers, ragi, bajra, jowar, FPO, agriculture, India",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shree Anna",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/lgo.png" type="image/png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/lgo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <Providers>
          <LanguageProvider>
            <AuthProvider>
              <ErrorReporter />
              {children}
            </AuthProvider>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
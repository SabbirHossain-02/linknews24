import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import localFont from "next/font/local";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AdBanner } from "@/components/layout/AdBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HideOnAdmin } from "@/components/layout/HideOnAdmin";
import { RealtimeRefresh } from "@/components/providers/RealtimeRefresh";
import { TrackView } from "@/components/providers/TrackView";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Siyam Rupali — the free Bengali font from Prothom Alo's font stack
// (self-hosted; Shurjo itself is proprietary and cannot be used).
const siyamRupali = localFont({
  src: "./fonts/SiyamRupali.ttf",
  variable: "--font-siyam-rupali",
  display: "swap",
});

const title = "LinkNews24 — বাংলাদেশের নির্ভরযোগ্য অনলাইন নিউজ পোর্টাল";
const description =
  "জাতীয়, আন্তর্জাতিক, রাজনীতি, খেলা, বিনোদন ও প্রযুক্তির সর্বশেষ খবর — LinkNews24-এ।";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: "%s | LinkNews24" },
  description,
  applicationName: "LinkNews24",
  openGraph: {
    type: "website",
    siteName: "LinkNews24",
    locale: "bn_BD",
    title,
    description,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f2c4d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body
        className={`${siyamRupali.variable} ${hindSiliguri.variable} ${inter.variable} antialiased`}
      >
        <LocaleProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <HideOnAdmin>
                <RealtimeRefresh />
                <TrackView />
                <AdBanner />
                <SiteHeader />
              </HideOnAdmin>
              {children}
              <HideOnAdmin>
                <SiteFooter />
              </HideOnAdmin>
            </div>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

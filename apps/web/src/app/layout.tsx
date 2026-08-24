import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { getSeo } from "@/lib/seo";
import localFont from "next/font/local";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AdBanner } from "@/components/layout/AdBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooterSection } from "@/components/layout/SiteFooterSection";
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

/**
 * Built from the SEO page's settings, so what is typed there is what search
 * engines and social networks receive. Falls back to the shipped defaults if
 * the API cannot be reached — never to an empty head.
 */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const image = seo.defaultOgImage || undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.defaultDescription,
    applicationName: seo.siteName,
    keywords: seo.keywords
      ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : undefined,
    openGraph: {
      type: "website",
      siteName: seo.siteName,
      locale: "bn_BD",
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      url: SITE_URL,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: seo.twitterHandle || undefined,
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      images: image ? [image] : undefined,
    },
    // Switching the site to "not indexable" has to reach the robots meta tag
    // as well as robots.txt, or a page already known to Google stays listed.
    robots: seo.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    verification: {
      google: seo.googleVerification || undefined,
      other: seo.bingVerification
        ? { "msvalidate.01": seo.bingVerification }
        : undefined,
    },
    alternates: { canonical: SITE_URL },
  };
}

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
                <SiteFooterSection />
              </HideOnAdmin>
            </div>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

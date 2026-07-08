import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ConditionalAdBanner } from "@/components/layout/ConditionalAdBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
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

export const metadata: Metadata = {
  title: {
    default: "LinkNews24 — বাংলাদেশের নির্ভরযোগ্য অনলাইন নিউজ পোর্টাল",
    template: "%s | LinkNews24",
  },
  description:
    "জাতীয়, আন্তর্জাতিক, রাজনীতি, খেলা, বিনোদন ও প্রযুক্তির সর্বশেষ খবর — LinkNews24-এ।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${hindSiliguri.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <ConditionalAdBanner />
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

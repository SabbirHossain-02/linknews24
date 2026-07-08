"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdBanner } from "./AdBanner";

export function ConditionalAdBanner() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  if (pathname !== "/" || scrolled) return null;
  return <AdBanner />;
}

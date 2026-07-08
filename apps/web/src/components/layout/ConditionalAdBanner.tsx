"use client";

import { usePathname } from "next/navigation";
import { AdBanner } from "./AdBanner";

export function ConditionalAdBanner() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <AdBanner />;
}

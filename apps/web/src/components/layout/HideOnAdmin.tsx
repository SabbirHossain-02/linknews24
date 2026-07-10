"use client";

import { usePathname } from "next/navigation";

// Renders its children only on public routes — hides the site header/footer
// (and ad banner) inside the /admin panel.
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}

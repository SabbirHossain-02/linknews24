import type { Metadata } from "next";
import { EpaperView } from "./EpaperView";
import { getEpaperEditions } from "@/lib/api";

export const metadata: Metadata = {
  title: "E-Paper",
};

export default async function EpaperPage() {
  const editions = await getEpaperEditions();
  return <EpaperView editions={editions} />;
}

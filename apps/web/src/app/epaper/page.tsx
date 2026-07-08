import type { Metadata } from "next";
import { EpaperView } from "./EpaperView";

export const metadata: Metadata = {
  title: "E-Paper",
};

export default function EpaperPage() {
  return <EpaperView />;
}

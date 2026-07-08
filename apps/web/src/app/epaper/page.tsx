import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "ই-পেপার",
};

const today = new Date().toLocaleDateString("bn-BD", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function EpaperPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">ই-পেপার</h1>

      <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5">
        <button
          disabled
          aria-label="আগের সংস্করণ"
          className="text-foreground-muted/40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-ui text-sm font-medium text-foreground">{today}</span>
        <button
          disabled
          aria-label="পরের সংস্করণ"
          className="text-foreground-muted/40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-8 text-center">
        <span className="text-xl font-bold tracking-tight text-brand-navy/30">
          Link News<span className="text-brand-crimson/40">24</span>
        </span>
        <p className="font-semibold text-foreground">
          ই-পেপার সংস্করণ শীঘ্রই আসছে
        </p>
        <p className="max-w-sm font-ui text-sm text-foreground-muted">
          CMS থেকে দৈনিক সংস্করণ আপলোড শুরু হলে এখানে পূর্ণাঙ্গ PDF ভিউয়ার সক্রিয় হবে।
        </p>
        <button
          disabled
          className="mt-2 flex items-center gap-2 rounded-lg bg-brand-navy/20 px-4 py-2 font-ui text-sm font-medium text-white/70"
        >
          <Download className="h-4 w-4" />
          ডাউনলোড PDF
        </button>
      </div>
    </main>
  );
}

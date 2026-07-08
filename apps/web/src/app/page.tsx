export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-brand-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-semibold tracking-tight text-white">
            Link News<span className="text-brand-crimson">24</span>
          </span>
          <span className="font-ui text-xs uppercase tracking-[0.2em] text-white/50">
            বাংলা নিউজ পোর্টাল
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-ui text-xs uppercase tracking-[0.3em] text-brand-crimson">
          Coming Soon
        </p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          LinkNews24 শীঘ্রই আসছে
        </h1>
        <p className="max-w-md text-foreground-muted">
          জাতীয়, আন্তর্জাতিক, রাজনীতি, খেলা ও বিনোদনের সর্বশেষ খবর নিয়ে
          তৈরি হচ্ছে একটি নতুন অভিজ্ঞতা।
        </p>
      </main>

      <footer className="border-t border-border py-6 text-center font-ui text-xs text-foreground-muted">
        © {new Date().getFullYear()} LinkNews24. সর্বস্বত্ব সংরক্ষিত।
      </footer>
    </div>
  );
}

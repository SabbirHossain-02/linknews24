import Link from "next/link";
import { navItems } from "@/lib/mock-data";
import type { Category } from "@/types/content";
import { FacebookIcon, XIcon, YoutubeIcon } from "@/components/icons/SocialIcons";

const legalLinks = [
  { label: "আমাদের সম্পর্কে", href: "/about" },
  { label: "যোগাযোগ", href: "/contact" },
  { label: "গোপনীয়তা নীতি", href: "/privacy" },
  { label: "ব্যবহারের শর্তাবলী", href: "/terms" },
];

const footerCategories: Category[] = navItems.flatMap((item) =>
  item.children
    ? item.children
    : [{ id: item.label, name: item.label, slug: item.href!.slice(1) }],
);

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-brand-navy text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <span className="text-xl font-bold tracking-tight text-white">
            Link News<span className="text-brand-crimson">24</span>
          </span>
          <p className="mt-3 max-w-xs font-ui text-sm text-white/50">
            বাংলাদেশের পাঠকদের জন্য নির্ভরযোগ্য, দ্রুত ও ক্লিন সংবাদ অভিজ্ঞতা।
          </p>
          <div className="mt-4 flex gap-4">
            <a href="#" aria-label="Facebook" className="hover:text-white">
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white">
              <XIcon className="h-5 w-5" />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-white">
              <YoutubeIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-white/40">
            ক্যাটাগরি
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-ui text-sm">
            {footerCategories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/${cat.slug}`} className="hover:text-white">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-white/40">
            গুরুত্বপূর্ণ লিঙ্ক
          </h3>
          <ul className="mt-3 flex flex-col gap-2 font-ui text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-white/40">
            নিউজলেটার
          </h3>
          <p className="mt-3 font-ui text-sm text-white/50">
            প্রতিদিনের গুরুত্বপূর্ণ খবর সরাসরি আপনার ইমেইলে পান।
          </p>
          <form className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="ইমেইল ঠিকানা"
              className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 font-ui text-sm text-white placeholder:text-white/40 focus:border-brand-crimson focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded bg-brand-crimson px-4 py-2 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
            >
              সাবস্ক্রাইব
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center font-ui text-xs text-white/40">
        © {new Date().getFullYear()} LinkNews24. সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}

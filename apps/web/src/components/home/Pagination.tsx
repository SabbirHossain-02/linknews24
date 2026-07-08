import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  basePath,
  currentPage,
  totalPages,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pageHref = (page: number) =>
    page === 1 ? basePath : `${basePath}?page=${page}`;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="পেজিনেশন"
      className="flex items-center justify-center gap-2 pt-4"
    >
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`flex h-9 w-9 items-center justify-center rounded border border-border transition-colors ${
          currentPage === 1
            ? "pointer-events-none text-foreground-muted/40"
            : "text-foreground/70 hover:border-brand-crimson hover:text-brand-crimson"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          className={`flex h-9 w-9 items-center justify-center rounded font-ui text-sm transition-colors ${
            page === currentPage
              ? "bg-brand-navy text-white"
              : "text-foreground/70 hover:bg-surface"
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`flex h-9 w-9 items-center justify-center rounded border border-border transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none text-foreground-muted/40"
            : "text-foreground/70 hover:border-brand-crimson hover:text-brand-crimson"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}

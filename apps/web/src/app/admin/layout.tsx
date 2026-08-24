import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/AdminGate";

/**
 * The panel's own identity in the browser tab.
 *
 * Without this every admin page inherited the public site's title, so a row of
 * open tabs all read "LinkNews24 — বাংলাদেশের নির্ভরযোগ্য…" and there was no
 * telling the newsroom from the site. AdminShell narrows it further to the
 * section being viewed once the page is running.
 *
 * Search engines are told to stay away as well: robots.txt already disallows
 * /admin, but a page someone links to directly would otherwise still be
 * indexable.
 */
export const metadata: Metadata = {
  title: { absolute: "LinkNews24 Admin", template: "%s | LinkNews24 Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}

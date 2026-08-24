"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuthProvider";
import { AdminShell } from "./AdminShell";
import { useAdminText } from "@/lib/admin-strings";

/**
 * Sends anyone who is not signed in to the login page, and anyone who is away
 * from it.
 *
 * Split out of the admin layout so that layout can stay a server component and
 * give the panel its own page title — a client component cannot export
 * metadata, which is why every admin page was showing the public site's title
 * in the browser tab.
 */
function Gate({ children }: { children: React.ReactNode }) {
  const ax = useAdminText();
  const { user, loading } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) router.replace("/admin/login");
    if (user && isLogin) router.replace("/admin");
  }, [loading, user, isLogin, router]);

  if (isLogin) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface font-ui text-sm text-foreground-muted">
        {ax("লোড হচ্ছে…")}
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <Gate>{children}</Gate>
    </AdminAuthProvider>
  );
}

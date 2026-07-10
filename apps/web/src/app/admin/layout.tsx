"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AdminAuthProvider,
  useAdminAuth,
} from "@/components/admin/AdminAuthProvider";
import { AdminShell } from "@/components/admin/AdminShell";

function Gate({ children }: { children: React.ReactNode }) {
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
        লোড হচ্ছে…
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <Gate>{children}</Gate>
    </AdminAuthProvider>
  );
}

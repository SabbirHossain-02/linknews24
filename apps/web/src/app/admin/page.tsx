"use client";

import { Newspaper, Radio, Tv, Users } from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

const STATS = [
  { label: "মোট আর্টিকেল", value: "—", icon: Newspaper },
  { label: "ব্রেকিং নিউজ", value: "—", icon: Radio },
  { label: "লাইভ টিভি", value: "—", icon: Tv },
  { label: "অ্যাডমিন ইউজার", value: "—", icon: Users },
];

export default function AdminDashboard() {
  const { user } = useAdminAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">ড্যাশবোর্ড</h1>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        স্বাগতম, {user?.name} — এখান থেকে পুরো ওয়েবসাইট নিয়ন্ত্রণ করুন।
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-background p-5 shadow-sm"
          >
            <Icon className="h-5 w-5 text-brand-crimson" />
            <p className="mt-3 text-2xl font-bold text-heading">{value}</p>
            <p className="font-ui text-xs text-foreground-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-6 text-center font-ui text-sm text-foreground-muted">
        অ্যাডমিন প্যানেল ধাপে ধাপে তৈরি হচ্ছে — পরের ধাপে আর্টিকেল ম্যানেজমেন্ট ও
        রিচ টেক্সট এডিটর যুক্ত হবে।
      </div>
    </div>
  );
}

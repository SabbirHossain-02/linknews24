import type { Metadata } from "next";
import { LawyerFeed } from "@/components/directory/LawyerFeed";

export const metadata: Metadata = {
  title: "আইন সেবা",
  description:
    "বাংলাদেশ বার কাউন্সিলে তালিকাভুক্ত আইনজীবীদের তথ্য ও যোগাযোগ নম্বর।",
};

export default function LawyersPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-bold text-heading sm:text-3xl">আইন সেবা</h1>
      <p className="mt-2 max-w-2xl font-ui text-sm text-foreground-muted">
        বার কাউন্সিলে তালিকাভুক্ত আইনজীবীদের তথ্য। জেলা বেছে নিয়ে বা নাম ধরে
        খুঁজুন। আপনি আইনজীবী হলে ড্যাশবোর্ডের “আইন সেবা” থেকে তথ্য জমা দিন —
        সম্পাদক যাচাই করে অনুমোদন দিলে এখানে দেখা যাবে।
      </p>

      <div className="mt-6">
        <LawyerFeed />
      </div>
    </main>
  );
}

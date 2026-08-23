import type { Metadata } from "next";
import { DonorFeed } from "@/components/directory/DonorFeed";

export const metadata: Metadata = {
  title: "রক্ত সেবা",
  description:
    "রক্তদাতাদের তালিকা — রক্তের গ্রুপ ও জেলা অনুযায়ী খুঁজুন, সরাসরি ফোন করুন।",
};

/**
 * Blood service.
 *
 * Was a grid of eight group buttons that made you pick before seeing anyone.
 * It now opens straight onto the donor feed with group and district as filters,
 * because someone landing here usually needs a donor now, not a menu.
 */
export default function BloodPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-bold text-heading sm:text-3xl">রক্ত সেবা</h1>
      <p className="mt-2 max-w-2xl font-ui text-sm text-foreground-muted">
        স্বেচ্ছায় রক্তদানে আগ্রহী মানুষের তালিকা। রক্তের গ্রুপ ও জেলা বেছে নিয়ে
        খুঁজুন, তারপর সরাসরি ফোন করুন। নিজে রক্তদাতা হিসেবে নাম লেখাতে চাইলে
        ড্যাশবোর্ডের “রক্ত সেবা” থেকে তথ্য জমা দিন।
      </p>

      <div className="mt-6">
        <DonorFeed />
      </div>
    </main>
  );
}

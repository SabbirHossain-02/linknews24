import type { Metadata } from "next";
import { HospitalList } from "@/components/directory/HospitalList";

export const metadata: Metadata = {
  title: "হাসপাতাল সেবা",
  description:
    "বাংলাদেশের হাসপাতাল ও ক্লিনিকের ঠিকানা, হটলাইন নম্বর ও ২৪/৭ জরুরি সেবার তথ্য।",
};

export default function HospitalsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-bold text-heading sm:text-3xl">
        হাসপাতাল সেবা
      </h1>
      <p className="mt-2 max-w-2xl font-ui text-sm text-foreground-muted">
        জরুরি প্রয়োজনে হাসপাতালের হটলাইন নম্বর। ২৪ ঘণ্টা জরুরি সেবা যাদের আছে
        তারা উপরে দেখানো হয়েছে।
      </p>

      <div className="mt-6">
        <HospitalList />
      </div>
    </main>
  );
}

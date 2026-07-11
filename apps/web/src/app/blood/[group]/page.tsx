import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBloodGroup } from "@/lib/directory-data";
import { getDonors } from "@/lib/api";
import { DonorGroupView } from "@/components/directory/DonorGroupView";

type Params = { group: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { group } = await params;
  const g = getBloodGroup(group);
  return {
    title: g ? `${g.label} গ্রুপের রক্তদাতা` : "রক্তদাতা",
    description: g
      ? `${g.label} রক্তের গ্রুপের রক্তদাতাদের যোগাযোগ নম্বর।`
      : undefined,
  };
}

export default async function BloodGroupPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { group } = await params;
  const g = getBloodGroup(group);
  if (!g) notFound();
  const donors = await getDonors(group);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <DonorGroupView group={g.label} donors={donors} />
    </main>
  );
}

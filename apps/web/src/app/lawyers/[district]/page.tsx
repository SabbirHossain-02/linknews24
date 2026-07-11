import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDistrict } from "@/lib/directory-data";
import { getLawyers } from "@/lib/api";
import { LawyerDistrictView } from "@/components/directory/LawyerDistrictView";

type Params = { district: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { district } = await params;
  const d = getDistrict(district);
  return {
    title: d ? `${d.name} জেলার আইনজীবী` : "আইনজীবী",
    description: d
      ? `${d.name} জেলার আইনজীবীদের যোগাযোগ নম্বর।`
      : undefined,
  };
}

export default async function LawyerDistrictPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { district } = await params;
  const d = getDistrict(district);
  if (!d) notFound();
  const lawyers = await getLawyers(district);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <LawyerDistrictView
        districtBn={d.name}
        districtEn={d.nameEn}
        lawyers={lawyers}
      />
    </main>
  );
}

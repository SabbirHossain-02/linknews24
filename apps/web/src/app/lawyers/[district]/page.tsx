import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  districts,
  getDistrict,
  getLawyersByDistrict,
} from "@/lib/directory-data";
import { LawyerDistrictView } from "@/components/directory/LawyerDistrictView";

type Params = { district: string };

export function generateStaticParams() {
  return districts.map((d) => ({ district: d.slug }));
}

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

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <LawyerDistrictView
        districtBn={d.name}
        districtEn={d.nameEn}
        lawyers={getLawyersByDistrict(district)}
      />
    </main>
  );
}

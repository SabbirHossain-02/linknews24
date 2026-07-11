import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSidebar, getTag, toArticle } from "@/lib/api";
import { ReadingSidebar } from "@/components/home/ReadingSidebar";
import { TagListing } from "@/components/category/TagListing";

type PageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTag(slug);
  if (!data) return {};
  return {
    title: `#${data.tag.name}`,
    description: `LinkNews24-এ "${data.tag.name}" ট্যাগের সংবাদ।`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const data = await getTag(slug);
  if (!data) notFound();

  const items = data.articles.map(toArticle);
  const sidebar = await getSidebar();

  return (
    <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
      <TagListing tag={data.tag} items={items} />
      <div className="hidden lg:block">
        <ReadingSidebar mostRead={sidebar.mostRead} latestRead={sidebar.latest} />
      </div>
    </main>
  );
}

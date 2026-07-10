// One-off: import the frontend mock articles into the database so the public
// site (wired to the API) has real content. Run from apps/web so the "@/"
// alias resolves:
//   DATABASE_URL="postgresql://..." npx tsx scripts/seed-articles.ts
import { PrismaClient } from "@prisma/client";
import { allArticles, getArticleBody } from "@/lib/mock-data";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

function bodyHtml(article: (typeof allArticles)[number], locale: "bn" | "en") {
  return getArticleBody(article, locale)
    .map((p) => `<p>${p}</p>`)
    .join("");
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!admin) throw new Error("No super admin found — run the main seed first.");

  const cats = await prisma.category.findMany();
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < allArticles.length; i++) {
    const a = allArticles[i];
    const categoryId = catBySlug.get(a.category.slug);
    if (!categoryId) {
      skipped++;
      continue;
    }
    const exists = await prisma.article.findUnique({ where: { slug: a.slug } });
    if (exists) {
      skipped++;
      continue;
    }
    await prisma.article.create({
      data: {
        title: a.title,
        titleEn: a.titleEn,
        slug: a.slug,
        excerpt: a.excerpt,
        excerptEn: a.excerptEn,
        body: bodyHtml(a, "bn"),
        bodyEn: bodyHtml(a, "en"),
        categoryId,
        authorId: admin.id,
        authorName: a.author,
        imageTone: a.imageTone,
        isBreaking: Boolean(a.isBreaking),
        status: "PUBLISHED",
        viewCount: a.viewCount ?? 0,
        publishedAt: new Date(Date.now() - i * 3 * 60 * 60 * 1000),
      },
    });
    created++;
  }

  console.log(`Seeded articles — created: ${created}, skipped: ${skipped}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
